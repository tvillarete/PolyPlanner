/* Table of contents
 *  - Flowchart Components
 *  - Menu View Components
 */

/* Flowchart Components */

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
            <h3 class="curriculum-sheet-button"
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

var Block = {
    ribbon: () => {
        return `
            <div class="ribbon"></div>
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

function newYearComponent(id, yearTitle, year, chartBuilder=false) {
    summerQuarter = localStorage.summerQuarter ? true : false;
    var component = `
        <div class="year" id="${id}" name="${year}">
            <div class="head">
                <h2>${yearTitle}</h2>
            </div>
            <div class="quarter-holder">
                ${newQuarterComponent("Fall", year, false, chartBuilder, 0)}
                ${newQuarterComponent("Winter", year+1, false, chartBuilder, 1)}
                ${newQuarterComponent("Spring", year+1, /* lastQuarter */ summerQuarter ? false : true, chartBuilder, 2)}
        `;
        if (summerQuarter) {
            component = component.concat(`${newQuarterComponent("Summer", year+1, /* lastQuarter */ true, chartBuilder, 3)}`);
        }
    component = component.concat(`
            </div>
        </div>
    `);
    return component;
}

function newQuarterComponent(season, year, lastQuarter = false, chartBuilder=false, seasonId) {
    var value = year + `${seasonId}`;
    var currentSeason = getCurrentSeason();
    var quarterSeason = `${season} ${year}`;
    var quarter =  `
        <div class="quarter ${quarterSeason == currentSeason ? "current-quarter" : ''}" name="${quarterSeason}" id="${value}" value="${value}">
            <div class='quarter-head'>
                <h4 class="season">${season}</h4>
                <h4 class="quarter-unit-count"></h4>
            </div>
            ${chartBuilder ? newChartBuilderAddComponent() : ""}
        </div>
    `;
    if (!lastQuarter) {
        quarter = quarter.concat(`<div class="quarter-divider"></div>`);
    }
    return quarter;
}

function newBlockComponent(block_metadata, course_data, course_type = null, id = null) {
    if (!course_type) {
        course_type = block_metadata ? block_metadata.course_type.toLowerCase().split(' ').join("-") : "major";
    }
    var name = course_data.title;
    var catalog = `${course_data.dept} ${course_data.course_number}`;
    var desc = course_data.description;
    var prereqs = course_data.prereqs;
    var units = course_data.units;
    return `
        <div class="block-outline show-block"
         onmouseup="ChartEditor.determineBlockAction(this, '${name}', '${catalog}', '${desc}',
                                       '${prereqs}', '${units}', '${course_type}')">
            <div class="edit-block-button">
                <i class="material-icons">check</i>
            </div>
            <div class="block ${course_type}" id="${id}" value="${course_data.units}" data-courseType="${course_type}">
                ${newBlockCourseDataView(course_data)}
            </div>
        </div>
    `;
}

function newBlockCourseDataView(course_data) {
    return `
        ${Block.ribbon()}
        <h3 class="block-catalog-info"><b>${course_data.dept} ${course_data.course_number}</b></h3>
        <h5 class="block-title">${course_data.title}</h5>
        <h5 class="block-unit-count"><b>${course_data.units} Units</b></h5>
    `;
}

function newMultiBlockComponent(block_metadata, course_data) {
    var fullTitle = ``;
    var numCourses = course_data.length;
    var course_type = block_metadata.course_type.toLowerCase().split(' ').join("-");
    var id = '';
    course_data.forEach(function(val, index) {
        id = id.concat(`${index > 0 ? '-' : ''}${val._id}`);
    });
    var block = `
        <div class="block-outline show-block multi-block"
         onclick="ChartEditor.determineBlockAction(this, '${course_data.title}',
          '${course_data.description}', '${course_data.prereqs}', '${course_data.dept}',
          '${course_data.course_number}')">
            <div class="edit-block-button">
                <i class="material-icons">check</i>
            </div>
            <div class="block ${course_type}" id="${id}" value="${course_data[0].units}">
                <div class="ribbon"></div>
                <h5 class="block-catalog-info choose">Choose:</h5>
                <div class="block-catalog">
        `;
    course_data.forEach(function(val, index) {
        if (index == 0 && numCourses == 2) {
            block = block.concat(`<h4 class="course-catalog-title">
                <b>${val.dept} ${val.course_number}</b></h4><h4>or</h4>`);
        } else {
            block = block.concat(`<h4 class="course-catalog-title">
                                 <b>${val.dept} ${val.course_number}</b></h4>`);
        }

    });
    block = block.concat(`
                </div>
                <div class="course-specify-button" onclick="openMultiCourseSelector(this.parentNode); return false;">+</div>
            </div>
        </div>
    `);
    return block;
}

function newElectiveBlockComponent(block_metadata) {
    var course_type = block_metadata.course_type.toLowerCase().split(' ').join("-");
    var title = block_metadata.elective_title ? block_metadata.elective_title :
     block_metadata.course_type;
    var area = course_type === 'general-ed' ? `Area ${Chart.getGeArea()}` : '';
    return `
        <div class="block-outline show-block ${area !== '' ? 'ge-block' : 'elective-block'}"
         onclick="ChartEditor.determineBlockAction(this, '${area}', '${title}',
          '', '', 4, '${course_type}')">
            <div class="edit-block-button">
                <i class="material-icons">check</i>
            </div>
            <div class="block ${course_type}" id="${block_metadata._id}" value="4">
                <div class="ribbon"></div>
                <h3 class="block-catalog-info"><b>${title}</b></h3>
                <h5 class="block-title">${area}</h5>
                <h5 class="block-unit-count"><b>4 Units</b></h5>
                <div class="course-specify-button" onclick="openCourseSelector(this.parentNode)">+</div>
            </div>
        </div>
    `;
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

/* Menu Views */
function newChartBrowserView() {
    var view = Button.header('New Flowchart');
    $.each(availableCharts, function(index, value) {
        var major = Object.keys(availableCharts[index])[0];
        major = major.split('_').join(" ");
        if (major != $(".degree-name").text()) {
            view = view.concat(`
                <h3 class="menu-option slide-in-right" id="${Object.keys(value)}"
                 onclick="changeStockFlowchart(this.id)">${major}
                </h3>
            `);
        }
    });
    return view;
}

function newChartNamerView(newMajor) {
    newMajor = newMajor.replace(/'/g, "\\'");
    return `
        <form class="menu-form slide-in-right" id="chart-name-form" action="#">
            <div class="input-field col s6">
                <input id="chart-name-input" type="text" class="validate" autofocus autocomplete="off">
                <label for="chart-name-input">Chart Name</label>
            </div>
            <button class="slide-in-right" onclick="User.addChart('${newMajor}')">Submit</button>
        </form>
    `;
}

function newMultiCourseSelectorView(courseNames) {
    var view = '';
    var id = courseNames[0];
    courseNames.forEach(function(course, index) {
        if (index > 0) {
            var courseUrl = course.split(' ').join('/');
            view = view.concat(
                Button.menuOption('', "ChartEditor.replaceBlock('"+id+"', '"+courseUrl+"')", course, 'keyboard_arrow_right')
            );
        }
    });
    return view;
}

function newUtilitiesView() {
    return `
        ${Button.header('Degree Information')}
        <h3 class="menu-option slide-in-right ${$(".header-title").text() == 'New Flowchart' ? 'hidden' : ''}" onclick="showCurriculumSheet()">Get Curriculum Sheet
            <i class="material-icons">keyboard_arrow_right</i>
        </h3>
        <h4 class="modal-sub-header">Completed Units</h4>
        <h4 class="modal-statistic" id="ge-count">GE's: ${completedGECount}</h4>
        <h4 class="modal-statistic" id="support-count">Support: ${completedSupportCount}</h4>
        <h4 class="modal-statistic" id="major-count">Major: ${completedMajorCount}</h4>
    `;
}

function newLoginView() {
    return `
        ${Button.header('Log In')}
        <div class="login-img-container">
            <img class="school-logo login-img slide-in-right" src="img/school_logos/cpslo.png">
        </div>
        <form class="menu-form slide-in-right" id="login-form" action="#">
            <div class="input-field col s6">
                <input id="login-username" type="text" class="validate" autofocus>
                <label for="login-username">Username</label>
            </div>
            <div class="input-field col s6">
                <input id="login-password" type="password" class="validate">
                <label for="login-password">Password</label>
            </div>
            <p class="login-error-text slide-in-right hidden">Incorrect Username or Password</p>
            <button type="button" class="slide-in-right" onclick="User.login()">Submit</button>
            <div class="progress-bar hidden" id="submit-progress">
                <div class="indeterminate"></div>
            </div>
        </form>
        <h3 class="menu-option slide-in-right" id="toggle-rememberMe">Remember
            <label class="switch">
                <input type="checkbox" ${localStorage.rememberMe ? 'checked' : ''}>
                <div class="toggle round"></div>
            </label>
        </h3>
    `;
}

function newSettingsView(val) {
    return `
        ${Button.header('Settings')}
        <h3 class="menu-option slide-in-right" id="toggle-summerQuarter">Summer Quarter
            <label class="switch">
                <input type="checkbox" ${localStorage.summerQuarter ? 'checked' : ''}>
                <div class="toggle round" onclick="toggleSummerQuarter(this.parentNode)"></div>
            </label>
        </h3>
        <h3 class="menu-option slide-in-right" id="toggle-superSenior">Five Years
            <label class="switch">
                <input type="checkbox" ${localStorage.superSenior ? 'checked' : ''}>
                <div class="toggle round" onclick="toggleSuperSenior(this.parentNode)"></div>
            </label>
        </h3>
        ${Button.menuOption(/* id */ 'year-selector', /* clickEvent */ "changeWindow(this.id)",
         /* text */ 'Starting Year', /* icon */ 'keyboard_arrow_right')}
        ${Button.menuOption('about', "changeWindow(this.id)", 'About', 'keyboard_arrow_right')}
        ${Button.menuOption('', "User.remove()", 'Clear Cache', 'replay')}
    `;
}

function clearCache() {
    localStorage.removeItem('guestConfig');
    location.reload();
}

function newYearSelectorView(chartBrowser = false) {
    var element =  Button.header('When did you start?');
    var date = new Date();
    var year = date.getFullYear();
    for(i = (new Date()).getFullYear()+1; i >= year-6; i--){
        element = element.concat(`<h3 class="menu-option slide-in-right" value="${i}" onclick="changeStartYear(this, '${chartBrowser ? true : false}')">${i}</h3>`);
    }
    return element;
}

function newAboutView() {
    return `
        <div class="menu-logo-container slide-in-right">
            <div class="logo menu-logo">
                <div class="logo-letter">
                    <div id="top-f"></div>
                    <div id="bottom-f"></div>
                </div>
                <div class="bottom-text">flowchamp</div>
            </div>
        </div>
        <h3 class="modal-sub-header">FlowChamp was created to make college planning easier and more connected.</h3>
        <h3 class="modal-sub-header">Development of this project was done by two students attending Cal Poly.</h3>
        ${Button.menuOption('', "openUrlInNewTab('http://devjimheald.com')", 'Jim Heald (Backend)', 'open_in_new')}
        ${Button.menuOption('', "openUrlInNewTab('http://tannerv.com')", 'Tanner Villarete (Frontend)', 'open_in_new')}
    `
}

var Popup = {
    courseInfo: (name, catalog, description, prereqs, units, type) => {
        prereqs = prereqs == 'null' ? 'None' : prereqs;
        var dept = catalog.split(' ')[0];
        var num = catalog.split(' ')[1];
        return `
        <div class="popup-window">
            <div class="popup-header ${type}">
                <div class="popup-title-container">
                    <h3><b>${catalog}</b></h3>
                    <h3>${name}</h3>
                </div>
                <div class="close-popup-container">
                    <h3 id="close-popup-button"
                     onclick="Chart.closePopup()">&times;</h3>
                    <h3 id="popup-unit-count">${units} units</h3>
                </div>
            </div>
            <div class="popup-section prereq-container">
                <div class="popup-section-title">Prereqs</div>
                <div class="popup-section-body">${prereqs}</div>
            </div>
            <div class="popup-section description-container">
                <div class="popup-section-title">Description</div>
                <div class="popup-section-body">${description}</div>
            </div>
            <div class="popup-section button-container">
                <div class="popup-button"
                 onclick="window.open('http://polyratings.com/search.php?type=Class&terms=${dept}+${num}&format=long&sort=rating')">
                    Check PolyRatings
                 </div>
            </div>
        </div>

        `;
    },

    emptyCourseInfo: (name, catalog, units, type) => {
        var dept = catalog.split(' ')[0];
        var num = catalog.split(' ')[1];
        return `
        <div class="popup-window">
            <div class="popup-header ${type}">
                <div class="popup-title-container">
                    <h3><b>${catalog}</b></h3>
                    <h3>${name}</h3>
                </div>
                <div class="close-popup-container">
                    <h3 id="close-popup-button"
                     onclick="Chart.closePopup()">&times;</h3>
                    <h3 id="popup-unit-count">${units} units</h3>
                </div>
            </div>
            <div class="popup-section empty-popup-container">
                <h3>No course picked yet</h3>
            </div>
        </div>

        `;
    }
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


