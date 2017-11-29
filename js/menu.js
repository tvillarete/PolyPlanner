var Menu = {
    stack: [],

    init: () => {
        var $menuModal = $('.menu-modal');
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
    },

    open: () => {
        $(".welcome-container").addClass("fade-white");
        $(".floating-plus-button").hide();
        $('.menu-nav-buttons').removeClass('hidden');
        $("#menu-button").addClass("open").removeClass("closed");
        $(".menu-modal").removeClass("slide-out-left");
        $(".disabled").show();

        if (Menu.stack.length > 0) {
            $(".back-button").show();
        };

        $('.menu-modal').show().css('display', 'flex');
    },

    close: () => {
        $('.floating-plus-button').show();
        $("#menu-button").removeClass("open").addClass("closed");
        $(".menu-modal").addClass("slide-out-left");
        $(".menu-modal, .popup-message, .disabled, .back-button, .block-menu").fadeOut("fast");

        if ($('.base').hasClass('base-editing')) {
            $('.menu-nav-buttons').addClass('hidden');
        }
    },

    back: () => {
        var window = Menu.stack.pop();
        $(".menu-modal").html(window);
        $(".menu-modal").children().addClass("slide-in-left");
        if (Menu.stack.length == 0) {
            $(".back-button").fadeOut("fast");
        }
        setupAutocomplete();
    }
}

function changeStockFlowchart(newMajor, startYear = null) {
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

    Menu.close();
    Menu.init();
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
    Menu.stack.push(currentWindow.toArray());
}
