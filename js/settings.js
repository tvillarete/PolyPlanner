var savedSettings = localStorage.settings ? JSON.parse(localStorage.settings) : null;
var settings = savedSettings ? savedSettings : {summerQuarter: false};

function getSettings() {
    var settingsOptions = [
        'summerQuarter',
    ],
        value;
    settingsOptions.forEach(function(setting) {
        value = JSON.parse(localStorage.getItem(setting));
        checkSetting(setting, value);
    });
}

function toggleSummerQuarter(toggle) {
    var value = !($(toggle).find("input").prop('checked'));
    if (value) {
        localStorage.summerQuarter = true;
    } else {
        localStorage.removeItem('summerQuarter');
    }
    Chart.init();
}

function toggleSuperSenior(toggle) {
    var value = !($(toggle).find("input").prop('checked'));
    if (value) {
        localStorage.superSenior = true;
    } else {
        $("#5-tab").addClass("hidden");
        localStorage.removeItem('superSenior');
        checkWindowSize();
    }
    Chart.init();
}

function guestConfigExists() {
    if (Object.keys(guestConfig).length === 0 && guestConfig.constructor === Object) {
        return false;
    }
    return true;
}

function changeStartYear(yearItem, chartBrowser) {
    var startYear = parseInt($(yearItem).text());
    var config = User.data();

    config.start_year = startYear;
    User.update(config);

    if (chartBrowser == 'true') {
        changeWindow('chart-browser');
    } else {
        Menu.back();
    }
    $(".year").each(function(key, el) {
        $(this).attr("name", parseInt($(yearItem).text())+key);
    });
    $(".quarter").each(function(key, quarter) {
        var season = $(this).find(".season").text();
        var year = $(this).parent(".quarter-holder").parent(".year").attr("name");
        year = parseInt(year);
        if (season === 'Winter' || season === 'Spring') {
            year += 1;
        }
        $(this).attr("name", `${season} ${year}`);
    });
    Chart.setCurrentQuarter();
    ChartUpdater.checkCompletion();
}

function sendUserConfig(chartName = null) {
    var url = `${apiURL}users/${username}/config`;
    var data = JSON.stringify(userConfig);
    var request = $.post({
        contentType: "application/json",
        url: url,
        data: data
    });

    request.done(function(){
        if (chartName) {
            loadChart(chartName, /* userChart */ true);
        }
    });

    request.fail(function(response){
        console.log("->", userConfig);
        console.log(`error sending config to ${url}`);
        console.log(response)
    });
}
