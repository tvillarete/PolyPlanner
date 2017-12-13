var tabIndex = 1;
var completedUnits = {ge: 0, support: 0, major: 0};

var Chart = {
    courses: [],
    ge_areas: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'B6', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'],
    ge_count: 0,

    init: () => {
        var startYear = ChartUpdater.getStartYear();
        var numYears = localStorage.superSenior ? 5 : 4;
        var titles = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'SuperSenior'];
        Chart.clear();

        for (var i=0; i<numYears; i++) {
            $('.year-holder').append(
                newYearComponent(`year${i+1}`, titles[i], startYear+i)
            );
        }
        checkWindowSize();

        var charts = User.getCharts();
        if (!jQuery.isEmptyObject(charts))
            Chart.get();
    },

    get: () => {
        var title = User.getActiveChart();
        var major = User.getActiveMajor()
        var url = User.chartUrl(title);

        $.get({
            url: url,
            timeout: 10000,
        }).done(function(data) {
            $('.welcome-container').fadeOut('fast');
            $('.floating-plus-button').show();
            Chart.parse(data);
        }).fail(function() {
            popupMessage('Oops', 'Server crapped out');
        });
    },

    parse: (data) => {
        var seasons = ['Fall', 'Winter', 'Spring', 'Summer'];

        Chart.courses = [];
        $.each(data, function(key, value) {
            var year = value.block_metadata.time[0];
            var quarter = seasons.indexOf(value.block_metadata.time[1]);
            var dest = $('.year-holder').children().eq(year-1).children()
                .eq(1).children('.quarter').eq(quarter);
            var block_metadata = value.block_metadata;
            var course_data = value.course_data;

            if (course_data && course_data.length) {
                dest.append(newMultiBlockComponent(block_metadata, course_data));
            } else if (course_data) {
                dest.append(newBlockComponent(block_metadata, course_data, null, key));
            } else {
                dest.append(newElectiveBlockComponent(block_metadata));
            }
        });
        $('.quarter').append(`<div class="add-block-button">&plus;</div>`);
    },

    clear: () => {
        $('.year-holder').empty();
        $('.header-title').text('Welcome');
        $('.welcome-container').show();
        Chart.ge_count = 0;
    },

    curriculumSheet: (title) => {
        var startYear = ChartUpdater.getStartYear() - 2000;

        var url = `/PolyPlanner/pdf/${title}.pdf`;
        $('.site-container').html(`<embed src="${url}"/>`);
        Menu.close();
        $('.external-site-modal').show();
    },

    tab: (tabId) => {
        $(".block-outline").removeClass("show-block");
        $(".year").removeClass("slide-in-left slide-in-right");
        newTabIndex = parseInt(tabId);

        var newClass = newTabIndex > tabIndex ? "slide-in-right" : "slide-in-left";
        $("#year"+newTabIndex).addClass(newClass);

        tabIndex = newTabIndex;
    },

    setCurrentQuarter: () => {
        var currentSeason = getCurrentSeason();
        $(".quarter").removeClass("current-quarter");
        $(".quarter").each(function() {
            if ($(this).attr("name") == currentSeason) {
                $(this).addClass("current-quarter");
            }
        });
    },

    remove: (name, major) => {
        var config = User.data();

        if (User.logged_in) {
            API.deleteChart(name);
        }
        delete config.charts[name];
        var newActive = Object.keys(config.charts)[0];
        config.active_chart = newActive ? newActive : '';
        User.update(config);
        Menu.reloadCharts();
    },

    deleteCourses: () => {
        var chart = User.getActiveChart();
        console.log(chart);
        $('.selected-block .block').each(function() {
            if (User.logged_in) {
                API.deleteCourse(chart, $(this).attr('id'));
            }
        });
        ChartEditor.deleteSelectedBlocks();
    },

    getGeArea: () => {
        if (Chart.ge_count == Chart.ge_areas.length) {
            Chart.ge_count = 0;
        }
        return Chart.ge_areas[Chart.ge_count++];
    },

    displayPopup: (name, catalog, description, prereqs, units, type, isTech) => {
       $('.popup-disabled').show();
       var popup = Popup.courseInfo(name, catalog, description, prereqs, units, type);
       if (catalog === 'General Ed') {
            popup = Popup.emptyCourseInfo(name, catalog, units, type);
       } else if (catalog == 'undefined') {
            popup = Popup.emptyCourseInfo('Use edit mode to choose',
                                          'Multiple Choices', 4, 'general-ed');
       }
       $('body').append(popup);
    },

    closePopup: () => {
        $(".popup-disabled").fadeOut("fast");
        $(".popup-window").animate({
            opacity: 0,
            top: "-=150",
        }, 100, function() {
            $(this).remove();
        });
    },
}

var User = {
    logged_in: localStorage.userConfig && localStorage.remember === 'true',

    checkLoginStatus: () => {
        if (localStorage.userConfig) {
            API.loginStatus();
        } else {
            return false;
        }
    },

    username: () => {
        if (localStorage.userConfig) {
            return User.data().username.split('-')[1];
        } else {
            return 'Guest';
        }
    },

    data: () => {
        if (localStorage.userConfig) {
            return JSON.parse(localStorage.userConfig);
        } else if (localStorage.guestConfig) {
            return JSON.parse(localStorage.guestConfig);
        } else {
            return {charts: {}, username: 'cpslo-guest'}
        }
    },

    getActiveChart: () => {
        var config = User.data();
        var activeChart = config.active_chart;
        $('.header-title').text(activeChart);
        if (User.logged_in) {
            return config.active_chart;
        } else {
            return config.charts[activeChart];
        }
    },

    getActiveMajor: () => {
        var config = User.data();
        var activeChart = config.active_chart;
        return config.charts[activeChart];
    },

    setActiveChart: (chart) => {
        var config = User.data();
        if (config.active_chart !== chart) {
            config.active_chart = chart;
            User.update(config);
        }

        $('.chart-select-component').each(function() {
            if ($(this).find('.chart-name').text() === chart) {
                $(this).removeClass('inactive');
            } else {
                $(this).addClass('inactive');
            }
        });
    },

    chartUrl: (title) => {
        if (User.logged_in) {
            return `${apiURL}users/${User.username()}/charts/${title}`;
        } else {
            return `${apiURL}stock_charts/15-17/${title}`;
        }
    },

    getCharts: () => {
        var config = User.data();
        return config.charts;
    },

    getStartYear: () => {
        var config = User.data();
        if (config.start_year) {
            changeWindow('chart-browser');
        } else {
            changeWindow('chart-year-browser')
        }
    },

    addChart: (major) => {
        var title = $('#chart-name-input').val();
        $('#chart-name-input').blur();
        var config = User.data();

        config.charts[`${title}`] = major;
        config.active_chart = title;
        User.update(config);

        if (User.logged_in) {
            API.importChart(major, title);
        } else {
            Menu.init();
        }
    },

    update: (newConfig) => {
        if (User.logged_in) {
            API.updateUserConfig(newConfig);
            localStorage.userConfig = JSON.stringify(newConfig);
        } else {
            localStorage.guestConfig = JSON.stringify(newConfig);
            Chart.init();
        }
    },

    remove: () => {
        if (User.logged_in) {
            API.logout();
        }
        localStorage.removeItem('userConfig');
        localStorage.removeItem('guestConfig');
        location.reload();
    },

    login: () => {
        var usernameEntered = $("#login-username").val();
        var password = $("#login-password").val();
        var remember = ($("#toggle-rememberMe").find("input").prop('checked'));
        var header = window.btoa(usernameEntered+":"+password);
        var data = JSON.stringify(remember ? {'remember': 'true'} : '');
        if (remember)
            localStorage.remember = 'true';
        else
            localStorage.removeItem('remember')

        API.authorize(username, password, header, data);
    }
}
