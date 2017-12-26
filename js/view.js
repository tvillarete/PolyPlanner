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
            var courseUrl = course.trim().split(' ').join('/');

            view = view.concat(
                Button.menuOption('', `ChartEditor.replaceBlock('${id}', '${courseUrl}')`, course, 'keyboard_arrow_right')
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

