/* Table of contents
 *  - Flowchart Components
 *  - Menu View Components
 */

/* Flowchart Components */

var Year = {
    init: yearOptions => {
        var seasons = ['Fall', 'Winter', 'Spring', 'Summer'];
        var currentSeason = getCurrentSeason();
        var numQuarters = yearOptions.showSummerQuarter ? 4 : 3;

        $('.year-holder').append(Year.element(yearOptions));
        for (var i=0; i < numQuarters; i++) {
            var fullSeason = `${seasons[i]} ${yearOptions.year}`;
            var quarterOptions = {
                destination: $(`#${yearOptions.id}`),
                season: seasons[i],
                id: yearOptions.year + `${i}`,
                classes: fullSeason == currentSeason ? 'current-quarter' : '',
                fullSeason: fullSeason,
                showDivider: i < numQuarters-1,
            }
            Quarter.init(quarterOptions);
        }
    },

    element: options => {
        return `
            <div class="year" id="${options.id}" name="${options.year}" value="${options.value}">
                <div class="head">
                    <h2>${options.title}</h2>
                </div>
                <div class="quarter-holder"></div>
            </div>
        `;
    }
}

var Quarter = {
    init: options => {
        options.destination.find('.quarter-holder').append(Quarter.element(options));
    },

    element: options => {
        return `
            <div class="quarter ${options.classes}" name="${options.fullSeason}"
             id="${options.id}" value="${options.season}">
                <div class="quarter-head">
                    <h4 class="season">${options.season}</h4>
                    <h4 class="quarter-unit-count"></h4>
                </div>
            </div>
            ${options.showDivider ? '<div class="quarter-divider"></div>' : ''}
        `;
    }
}

var Block = {
    init: options => {
        var id = `#${options.id}`;
        var block = Block.element(options);
        if (options.initType === 'append') {
            $(block).insertBefore($('.appending .add-block-button'));
        } else if (options.initType === 'replace') {
            options.destination.replaceWith(block);
        } else {
            options.destination.append(block);
        }

        $(id).parent().data(options.data);
    },

    element: (options) => {
        var clickEvent = 'ChartEditor.determineBlockAction(this)';

        return `
            <div class="block-outline show-block ${options.className}"
             onclick="${clickEvent}">
                <div class="edit-block-button">
                    <i class="material-icons">check</i>
                </div>
                <div class="block ${options.className}" id="${options.id}"
                 value="${options.hasCourseData ? options.data.course_data.units : 4}" >
                    ${Block.contents(options)}
                </div>
            </div>
        `;
    },

    contents: options => {
        var course_data = options.data.course_data;
        var header = options.header;
        var contents = options.contents ? options.contents : 'Area ' + Chart.getGeArea();
        var units = course_data ? course_data.length ?
            course_data[0].units : course_data.units : 4;
        options.genericCourse = !(course_data);
        options.multiCourse = course_data && course_data.length;

        if (course_data && course_data.length) {
            contents = '';
            $.each(course_data, function(index, course) {
                contents = contents.concat(`
                    <p class="course-catalog-title">
                        ${course.dept} ${course.course_number}
                    </p>
                `);
            });
        }

        return `
            <h3 class="block-header">${header}</h3>
            <div class="block-contents">${contents}</div>
            <h5 class="block-units">${units} Units</h5>
            ${Block.courseSelectorButton(options)}
        `;
    },

    courseSelectorButton: options => {
        if (!(options.genericCourse || options.multiCourse))
            return '';
        var clickEvent = options.genericCourse ?
            'openCourseSelector(this.parentNode); return false;' :
            'openMultiCourseSelector(this.parentNode); return false;'
        return `
            <div class="course-specify-button" onclick="${clickEvent}">
                <i class="material-icons">edit</i>
            </div>
        `;
    },

    getHeader: (block_metadata, course_data) => {
        if (block_metadata) {
            if (block_metadata.course_type === 'General Ed') {
                return block_metadata.course_type;
            } else if (block_metadata.elective_title) {
                return block_metadata.elective_title;
            } else if (!course_data.length){
                return `${course_data.dept} ${course_data.course_number}`;
            } else {
                return "Choose";
            }
        } else if (course_data && !course_data.length) {
            return `${course_data.dept} ${course_data.course_number}`;
        }
        return "Choose";
    },

    getSubtitle: data => {
        if (!$.isEmptyObject(data.block_metadata)) {
            if (data.course_data) {
                if (data.block_metadata.course_type === 'General Ed') {
                    return data.course_data && data.course_data.length ?
                        'Multiple Courses Available' :
                        'Course not specified';
                } else if (data.course_data && data.course_data.length) {
                    return "Multiple Courses Available"
                }
                return data.course_data.title;
            }
            return data.block_metadata.elective_title;
        }
        return data.course_data.title;
    },

    getCourseType: (block_metadata, course_data) => {
        return block_metadata ? block_metadata.course_type : 'blank'
    },

    getInfoSections: (data) => {
        if (data.course_data && !data.course_data.length) {
            return {
                'prereq-container': {
                    title: 'Prereqs',
                    text: data.course_data.prereqs ? data.course_data.prereqs :
                    'None',
                },
                'description-container': {
                    title: 'Description',
                    text: data.course_data.description,
                },
                'notes-container': {
                    title: 'Notes',
                    text: data.block_metadata ? data.block_metadata.notes ? data.block_metadata.notes : 'None' : 'None'
                }
            }
        } else {
            return {
                'description-container': {
                    title: 'Instructions',
                    text: 'Click the pencil in the bottom right to edit this block'
                }
            }
        }
    }
}

var Button = {
    actionButton: (text, clickEvent) => {
        return `
            <div class="button action-button slide-in-right" onclick="${clickEvent}">
                ${text}
            </div>
        `;
    },

    menuOption: (id, clickEvent, text, icon) => {
        return `
            <h3 class="menu-option slide-in-right" id="${id}" onclick="${clickEvent}">
                ${text}
                <i class="material-icons">${icon}</i>
            </h3>
        `;
    },

    chartSelection: (name, major, isActive) => {
        var parsedMajor = major.split('_').join(' ');
        return `
            <div class="chart-select-component slide-up
             ${isActive ? 'active' : 'inactive'}">
                <div class="chart-select-button" onclick="User.setActiveChart('${name}')">
                    <h3 class="chart-name">${name}</h3>
                    <h3 class="chart-major">${parsedMajor}</h3>
                </div>
                ${Button.curriculumSheet(major)}
                <div class="delete-chart-button"
                 onclick="Chart.remove('${name}', '${major}')">
                    &times;
                </div>
            </div>
        `;
    },

    curriculumSheet: (major) => {
        return `
            <h3 class="button curriculum-sheet-button"
             onclick="Chart.curriculumSheet('${major}'); return false">
                Curriculum Sheet
            </h3>
        `;
    },

    header: (text) => {
        return `
            <h2 class='modal-header slide-in-right'>
                <b>${text}</b>
            </h2>
        `;
    },

    headerButton: (id, clickEvent, icon) => {
        return `
            <div class="header-button"
             id="${id}" onclick="${clickEvent}">
                <i class="material-icons">${icon}</i>
            </div>
        `;
    }
}

var Input = {
    searchWithCompletion: (id) => {
        return `
            <div class = "ui-widget department-searchbar slide-in-right">
                <input class="input-field" id ="${id}" autofocus placeholder="Search" maxlength="4">
            </div>`;
    }
}

var View = {
    curriculumSheet: () => {
        var view = '';
        var charts = User.getCharts();

        $.each(charts, function(stockName, name) {
	        stockName = stockName.replace(/'/g,'');
            view = view.concat(
                Button.menuOption('', "Chart.curriculumSheet('"+name+"')", stockName, '')
            );
        });

        return view;
    }
}


/* Chart Builder Components */

function newChartBuilderAddComponent() {
    return `
        <div class="add-block-count-container show-block">
            <div class="input-field col s6">
                <input type="text" class="add-block-input" maxlength="1" placeholder="# Courses">
            </div>
            <div class="add-block-amount-button" onclick="addCourseSpecifier(this.parentNode)">
                <i class="material-icons">add</i>
            </div>
        </div>
    `;
}

function newCourseSpecifierComponent() {
    var component =  `
        <div class="course-specifier-container show-block">
            <div class="course-specifier-input-container">
                <div class="input-field col s6">
                    <input type="text" class="department-specifier-input" placeholder="DEPT" onchange="fetchFullCourse(this.parentNode)">
                </div>
                <div class="input-field col s6">
                    <input type="text" class="number-specifier-input" placeholder="#">
                </div>
            </div>
            <select class="course-type-dropdown">
    `;
    course_types.forEach(function(course_type) {
        component = component.concat(`<option value="${course_type}">${course_type}</option>`)
    });

    component = component.concat (
        `</select>
            <div class="add-course-button" onclick="fetchFullCourse(this.parentNode)">
                <i class="material-icons">add</i>
            </div>
        </div>
    `);
    return component;
}

function clearCache() {
    localStorage.removeItem('guestConfig');
    location.reload();
}

var Popup = {
    init: options => {
        var element = Popup.element(options);
        $('.popup-disabled').show();
        $('body').append(element)
    },

    element: options => {
        return `
            <div class="popup-window">
                <div class="popup-header ${options.class}">
                    ${Popup.header(options)}
                </div>
                <div class="popup-body">
                    ${Popup.body(options.sections)}
                    ${options.button ? Popup.button(options.button) : ''}
                </div>
            </div>
        `;
    },

    header: options => {
        return `
            <div class="popup-title-container">
                <h3><b>${options.title}</b></h3>
                <h3>${options.subtitle}</h3>
            </div>
            <div class="close-popup-container">
                <h3 id="close-popup-button" onclick="Popup.remove()">&times;</h3>
                <h3 id="popup-unit-count">${options.value}</h3>
            </div>
        `;
    },

    body: options => {
        var view = '';
        $.each(options, function(key, section) {
            view = view.concat(Popup.section({
                class: key,
                title: section.title,
                text: section.text,
            }));
        });
        return view;
    },

    section: options => {
        return `
            <div class="popup-section ${options.class}">
                <div class="popup-section-title">${options.title}</div>
                <div class="popup-section-body">${options.text}</div>
            </div>
        `;
    },

    button: options => {
        return `
            <div class="popup-section button-container">
                <div class="popup-button" onclick="${options.clickEvent}">
                    ${options.title}
                </div>
            </div>
        `;
    },

    remove: () => {
        $(".popup-disabled").fadeOut("fast");
        $(".popup-window").animate({
            opacity: 0,
            top: "-=150",
        }, 100, function() {
            $(this).remove();
        });
    },
}

var MenuView = {
    main: () => {
        var loggedIn = User.logged_in;
        var view = `
            <div class="menu-logo-container slide-right">
                <div class="logo menu-logo"></div>
            </div>
            <h3 class="subheader slide-right">Flowcharts</h3>
            <div class="flowchart-section">
        `;
        view = view.concat(MenuView.ChartSelectButtons());
        view = view.concat(`
            </div>
            <div class="menu-profile-section slide-right">
                <h3 class="menu-option" id="settings-button" onclick="changeWindow(this.id)">
                    <i class="material-icons">settings</i>
                    Settings
                </h3>
                <h3 class="menu-option ${loggedIn ? 'hidden' : ''}"
                 id="login-button" onclick="changeWindow(this.id)">
                    <i class="material-icons">person</i>
                    Log In
                </h3>
                <h3 class="menu-option ${loggedIn ? '' : 'hidden'}"
                 id="logout-button" onclick="User.remove()">
                    <i class="material-icons">person_outline</i>
                    Log Out
                </h3>
            </div>
        `);

        return view;
    },

    ChartSelectButtons: () => {
        var charts = User.getCharts();
        var config = User.data();
        var view = '';

        $.each(charts, function(name, major) {
            var isActive = config.active_chart === name;
            view = view.concat(`
                ${Button.chartSelection(name, major, isActive)}
            `);
        });
        view = view.concat(`
            <div class="add-chart-button slide-up"
             onclick="User.getStartYear()">&plus;
            </div>
        `);

        return view;
    }
}


