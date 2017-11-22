var Menu = {
    init: () => {
        var $menuModal = $('.menu-modal');
        emptyStack();
        $menuModal.empty();
        $('.back-button').fadeOut('fast');
        $menuModal.append(
            MenuView.main()
        );
    },

    reloadCharts: () => {
        $('.flowchart-section').empty().append(
            MenuView.ChartSelectButtons()
        );
    }
}

function changeStockFlowchart(newMajor, startYear = null) {
    $(".block-outline").addClass("hide-block");
    changeWindow("chart-namer", "Give It a Name", newMajor);
}

function saveChartInfo(newMajor) {
    var chartName = $("#chart-name-input").val();
    var config = User.data();

    config.charts[`${chartName}`] = newMajor;
    config.active_chart = chartName;
    config.active_dept = newMajor;

    User.update(config);
    Chart.init();
    postChart(newMajor, chartName);

    closeMenu();
    emptyStack();
}

function openMenu() {
    $(".welcome-container").addClass("fade-white");
    $(".floating-plus-button").fadeOut("fast");

    if (menuStack.length > 0) {
        $(".back-button").show();
    };

    $("#edit-flowchart").addClass("unclickable");
    $(".header").addClass("shrink-header");
    $("#menu-button").addClass("open").removeClass("closed");
    $(".menu-modal").removeClass("slide-out-left");
    closeChartEditMenu();
    $(".popup-message").remove();
    $(".disabled").show();
	$('.menu-modal').show().css('display', 'flex');
}

$('.base').click(function() {
    closeChartEditMenu();
});

function closeChartEditMenu() {
    $('.chart-menu').fadeOut("fast", function() {
        $(this).addClass('hidden').show();
        $('.chart-menu-open-button').removeClass('active-button');
    });
}

function closeMenu() {
    $('.floating-plus-button').fadeIn('fast');
    $("#menu-button").removeClass("open").addClass("closed");
    $(".checked").removeClass("checked");
    $("#edit-flowchart").removeClass("unclickable");
    $(".header").removeClass("shrink-header");
    $(".menu-modal").addClass("slide-out-left");
    $(".menu-modal, .popup-message, .disabled, .back-button, .block-menu").fadeOut("fast");
}

function changeWindow(target, title=null, optionalData = null) {
    var element = "";
    var currentWindow = $(".menu-modal").children();
    var view = currentWindow;

    if (title != null) {
        element = `<h2 class="modal-header slide-in-right">${title}</h2>`;
    }
    switch(target) {
        case "chart-browser":
            view = newChartBrowserView();
            break;
        case "chart-namer":
            view = newChartNamerView(optionalData);
            break;
        case "chart-year-browser":
            view = newYearSelectorView(/* chartBrowser */ true);
            break;
        case "user-chart-browser":
            view = newUserChartBrowserView();
            break;
        case "curriculum-sheet-browser":
            view = View.curriculumSheet();
            break;
        case "utilities-browser":
            view = newUtilitiesView();
            break;
        case "login-button":
            view = newLoginView();
            break;
        case "signup-button":
            view = newSignupView();
            break;
        case "settings-button":
            view = newSettingsView();
            break;
        case "login-button":
            view = newLoginView();
            break;
        case "department-selector":
            view = newDepartmentSelectorView(optionalData);
            break;
        case "course-selector":
            view = newCourseSelectorView();
            break;
        case "multi-course-selector":
            view = newMultiCourseSelectorView(optionalData);
            break;
        case "year-selector":
            view = newYearSelectorView();
            break;
        case "edit-tips":
            view = View.editTips();
            break;
        case "about":
            view = newAboutView();
            break;
                 }
    $(".back-button").show();
    element = element.concat(view);
    $(".menu-modal").empty().append(element);
    menuStack.push(currentWindow.toArray());
}

function popStack() {
    var window = menuStack.pop();
    $(".menu-modal").html(window);
    $(".menu-modal").children().addClass("slide-in-left");
    if (menuStack.length == 0) {
        $(".back-button").fadeOut("fast");
    }
    setupAutocomplete();
}

function emptyStack() {
    var view;
    while (menuStack.length > 0) {
        view = menuStack.pop();
    }
    $(".menu-modal").html(view);
    $(".back-button").fadeOut("fast");
}

function fetchCharts() {
    $(".menu-modal").empty().append("<h2 class='modal-header slide-in-right'>New Flowchart</h2>");
    if (!availableCharts) {
        $(".menu-modal").append(`<h3 class="menu-option slide-in-right">Couldn't Get Majors</h3>`);
    }
    $.each(availableCharts, function(index, value) {
        var major = value;
        major = major.split('_').join(" ");
        if (major != $(".degree-name").text()) {
            $(".menu-modal").append("<h3 class='menu-option slide-in-right' id='"+value+"' onclick='changeStockFlowchart(this.id)'>"+major+"</h3>");
        }
    });
}

function showCurriculumSheet() {
    var major = $(".header-title").text();
    major = major.split(' ').join("%20");
    var url = "https://flowcharts.calpoly.edu/downloads/curric/15-17."+major+".pdf";
    console.log(url);
    closeMenu();
    $(".external-site-modal").show();
    var element =
        `<object data="${url}" type="application/pdf" width="100%" height="100%">
            <p>Hmm.. There doesn't seem to be a curriculum sheet available</p>
        </object>`
    $(".site-container").html(element);

}
