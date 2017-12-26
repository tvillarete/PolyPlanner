$(document).on('click', '.add-block-button', function() {
    if (!$(this).parent().hasClass("appending") || menuStack.length == 0) {
        Menu.init();
        $(".quarter").removeClass("appending");
        $(this).parent().addClass("appending");
        showCourseSelector();
    } else {
        Menu.open();
    }
    disableChart();
});

function setupBuilder() {
    var yearComponents = `
        ${newYearComponent("year1", "Freshman", startYear, true)}
        ${newYearComponent("year2", "Sophomore", startYear + 1, true)}
        ${newYearComponent("year3", "Junior", startYear + 2, true)}
        ${newYearComponent("year4", "Senior", startYear + 3, true)}
    `;
    $(".year-holder").empty().append(yearComponents);
    $(".welcome-container").fadeOut("fast");
    if (!$("#chart-builder").hasClass("building")) {
        $("#chart-builder").addClass("building");
        $(".header-title").text("New Flowchart");
    }
    checkWindowSize();
    Menu.close();
}

function showCourseSelector() {
    changeWindow("department-selector", "Departments");
    setupAutocomplete('department-search');
    Menu.open();
}

function setupAutocomplete(id) {
    var input = $(`#${id}`);
    input.autocomplete({
        source: departments,
        open: function(e, ui) {
            var list = [];
            var element = ``;
            var results = $('.ui-widget-content li');
            results.each(function() {
                var value = $(this).text();
                element = element.concat(`
                    <h3 class="menu-option department-item" name="${value}" onclick="fetchDepartmentCourses('${value}')">
                        ${value}
                    </h3>
                `);
            });
            $('#departmentResults').html(element);
        }
    });
}

function newDepartmentSelectorView() {
    var element = Input.searchWithCompletion('department-search');
    var departmentResults = `<div class="department-results slide-in-right" id='departmentResults'>`;

    $.each(departments, function(index, value) {
        departmentResults = departmentResults.concat(`<h3 class="menu-option department-item" name="${value}" onclick="fetchDepartmentCourses('${value}')">${value}</h3>`);
    });
    departmentResults = departmentResults.concat(`</div>`)
    return element.concat(departmentResults);
}

function newCourseSelectorView() {
    var element = "<div>";
    $.each(departmentCourses, function(index, value) {
        if (index > 0) {
            element = element.concat(`<h3 class="menu-option course-item slide-in-right"
             name="${departmentCourses[0] /* Department Name */}/${value}" onclick="fetchCourse(this)">${value}</h3>`);
        }
    });
    element = element.concat('</div>');
    return element;
}

function fetchDepartments() {
    var deps = [];
    var request = $.get({
        url: apiURL+"courses"
    });

    request.done(function(data) {
        data.departments.forEach(function(value) {
            departments.push(value);
        });
    });
}

function fetchDepartmentCourses(dept) {
    departmentCourses = [];
    var departmentName = dept;
    var request = $.get({
        url: `${apiURL}courses/${departmentName}`
    });

    request.done(function(data) {
        departmentCourses.push(departmentName);
        data.courses.forEach(function(value) {
            departmentCourses.push(value);
        });
    });

    request.then(function() {
        changeWindow("course-selector", departmentName);
    })
}

function fetchCourse(courseItem) {
    var courseName = $(courseItem).attr("name");
    var request = $.get({
        url: `${apiURL}courses/${courseName}`
    });

    request.done(function(data) {
        data = {block_metadata: {}, course_data: data};
        data.block_metadata.course_type = !$('.appending').length ?
            $('.block.replaceable').attr('class').split(' ')[1] : "blank";

        Block.init({
            destination: $('.appending').length ? $('.appending') : $('.replaceable').parent(),
            initType: $('.appending').length ? 'append' : 'replace',
            header: Block.getHeader(null, data.course_data),
            data: data,
            className: Block.getCourseType(data.block_metadata, data.course_data),
            contents: data.course_data.title,
            id: data._id,
        });

        Menu.init();
        Menu.stack = [];
    });
    Menu.close();
}

function addCourseSpecifier(addComponent) {
    var numCourses = parseInt($(addComponent).find(".add-block-input").val());
    var quarter = $(addComponent).parent(".quarter");
    for (var i=0; i<numCourses && i < 8; i++) {
        quarter.append(newCourseSpecifierComponent());
    }
    $(".department-specifier-input").autocomplete({
        source: departments,
    });
}

function fetchFullCourse(location) {
    var dept = $(location).find(".department-specifier-input").val().toUpperCase();
    var num = $(location).find(".number-specifier-input").val();
    var serialized = `${dept}/${num}`;
    var courseType = $(location).find(".course-type-dropdown").val();

    var request = $.get({
        url: `${apiURL}courses/${serialized}`
    });

    request.done(function(data) {
        var block = newBlockComponent(/* block_data */ {course_type: courseType}, data);
        $(location).replaceWith(block);

        if (isFullDesktop()) {
            enableChart();
        }
    });
}
