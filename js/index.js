const apiURL = "/api/cpslo/"
const course_types = ['Major', 'Free Class', 'Support', 'General Ed', 'Minor', 'Concentration'];

var availableCharts = [];
var departments = [];
var departmentCourses = [];
var savedChartBuilder;
var username = localStorage.username ? localStorage.username : "";
var userConfig = {};
var guestConfig = localStorage.guestConfig ? JSON.parse(localStorage.guestConfig) : '';
var startYear = getStartYear();
var chartLoaded = false;

$(document).ready(function() {
    checkWindowSize();
    $(".option-modal, .popup-disabled, .edit-container").hide();
    $('#menu-button').click(function(){
        if (!$(this).hasClass("open")) {
            $(this).addClass('open');
            Menu.open();
        } else {
            $(this).removeClass('open');
            Menu.close();
        }
    });
});

$.ajaxSetup({
    beforeSend:function() {
        $(".loading").addClass("progress-bar");
    },
    complete:function() {
        $(".loading").removeClass("progress-bar");
        $(".submit-loading").addClass("progress-bar").show();
    },
});

$(window).resize(function(){
    checkWindowSize();
});

function loadTasks() {
    //localStorage.removeItem('userConfig');
    document.addEventListener("touchstart", function(){}, true);
    if (localStorage.userConfig) {
        User.checkLoginStatus();
    } else {
        Chart.init();
    }
    Menu.init();
    getAvailableCharts();
    fetchDepartments();
}

function getStartYear() {
    if (userConfigExists()) {
        return parseInt(userConfig.start_year);
    } else if (guestConfig) {
        return parseInt(guestConfig.startYear);
    } else {
        return (new Date()).getFullYear();
    }
}

function userConfigExists() {
    if (Object.keys(userConfig).length === 0 && userConfig.constructor === Object) {
        return false;
    }
    return true;
}

function getCurrentSeason() {
    var month = (new Date()).getMonth();
    var year = (new Date()).getFullYear();
    var season;

    if (month >= 3 && month < 5) {
        season = 'Spring';
    } else if (month >= 5 && month < 8) {
        season = 'Summer';
    } else if (month >= 8 && month <= 11) {
        season = 'Fall';
    } else {
        season = "Winter";
    }
    return `${season} ${year}`;
}

function getAvailableCharts() {
    var request = $.get({
        url: apiURL+"stock_charts/15-17"
    });

    request.done(function(data) {
        availableCharts = [];
        $.each(data.charts, function(index, value) {
            availableCharts.push(value);
        });
    });
}

function isFullDesktop() {
    if ($(window).width() > 1000)
        return true;
    return false;
}

function checkWindowSize() {
    if ($(window).width() <= 750){
		$('ul.tabs').tabs();
        $('ul.tabs').show();
        $("body").removeClass("desktop");
	} else {
        $('ul.tabs').hide();
        $("body").addClass("desktop");
        $(".year").show();
    }
}

function openUrlInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

function closeSiteNav() {
    $(".external-site-modal").fadeOut("fast");
    Menu.open();
}

$(document).on('click', '.close-popup-message', function() {
    closePopupMessage();
})

function closePopupMessage() {
    $(".popup-disabled").fadeOut("fast");
    $(".popup-message").animate({
        opacity: 0,
        top: "-=150",
    }, 100, function() {
        $(this).remove();
    });
}

function popupMessage(title, message, dismiss=false, postNote=false) {
    var element =
        `<div class="popup-message z-depth-5">
            <h2 class="popup-title">${title}</h2>
            <h3 class="popup-body">`+message+`</h3>
            <h4 class="popup-ps">${postNote ? postNote : ""}</h4>
            <h4 class="close-popup-message ${dismiss ? "" : "hidden"}"
             onclick="closePopupMessage()">Okay</h4>
         </div>`;
    $(".popup-disabled").show();
    $("body").append(element);
}
