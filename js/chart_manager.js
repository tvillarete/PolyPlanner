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
            var yearOptions = {
                title: titles[i],
                year: startYear+i,
                id: `year${i+1}`,
                showSummerQuarter: localStorage.summerQuarter ? true : false,
            }
            Year.init(yearOptions);
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
            var className = block_metadata ?
                block_metadata.course_type.toLowerCase().split(' ').join('-') : '';

            var options = {
                destination: dest,
                block_metadata: value.block_metadata,
                course_data: value.course_data,
                className: className,
                id: key,
            };

            if (course_data && course_data.length) {
                dest.append(newMultiBlockComponent(block_metadata, course_data));
            } else if (course_data) {
                Block.init(options);
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

        var url = `pdf/${title}.pdf`;
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
