var API = {
    url: '/api/cpslo',

    authorize: (username, password, header, remember) => {
        var beforeSend = function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + header);
            $("#submit-progress").removeClass("hidden");
        }

        var request = API.newRequest(
            'POST', `${API.url}/authorize`, 'application/json', remember, beforeSend
        );

        request.done(function(config) {
            var guestConfig = User.data();
            if (guestConfig.charts && guestConfig.username === 'cpslo-guest') {
                var username = config.username.split('-')[1];
                config.active_chart = guestConfig.active_chart;

                $.each(guestConfig.charts, function(key, value) {
                    API.importChart(value, key, username, true);
                    config.charts[key] = value;
                });
            }
            User.logged_in = true;
            User.update(config);
            Menu.init();
        });
    },

    logout: () => {
        var request = API.newRequest('POST', `${API.url}/users/${User.username()}/logout`);

        request.done(function() {
            User.remove();
        });
    },

    stockCharts: () => {

    },

    importChart: (major, name, username, login) => {
        console.log(`Major: ${major}, Name: ${name}`);
        username = username ? username : User.username();
        var url = `${API.url}/users/${username}/import`;
        var data = JSON.stringify({
            "target": major,
            "year": "15-17",
            "destination": name
        });
        var request = API.newRequest('POST', url, 'application/json', data)

        request.done(function(response) {
            if (!login) {
                Menu.init();
            }
        });

        request.fail(function(response) {
            console.log(response);
        });
    },

    loginStatus: () => {
        var request = API.newRequest('GET', `${API.url}/users/${User.username()}`);

        request.done(function(response) {
            console.log(response);
            API.getUserConfig();
        });

        request.fail(function(response) {
            if (response.status == 418) {
                User.logged_in = true;
                Chart.init();
                Menu.init();
            } else {
                User.remove();
            }
        });
    },

    getUserConfig: () => {
        var request = API.newRequest('GET', `${API.url}/users/${User.username()}/config`);

        request.done(function(config) {
            console.log('hi');
            User.logged_in = true;
            User.update(config);
            $("#login-button").addClass('hidden');
            $("#logout-button").removeClass("hidden");
        });
    },

    updateUserConfig: (newConfig) => {
        var username = newConfig.username.split('-')[1];
        var url = `${API.url}/users/${username}/config`;
        var data = JSON.stringify(newConfig);
        var request = API.newRequest('POST', url, 'application/json', data);

        request.done(function(response) {
            Chart.init();
        });
    },

    userCharts: () => {

    },

    addCourseToChart: () => {
        if (User.logged_in) {
            var chart = User.getActiveChart();
            var contentType = 'application/json';
            var request = API.newRequest('POST', `${API.url}/users/${User.username()}/charts`, contentType);
        }
    },

    deleteChart: (name) => {
        var url = `${API.url}/users/${User.username()}/charts/${name}`;
        var request = API.newRequest('DELETE', url);
    },

    getCourseById: () => {

    },

    updateCourse: () => {

    },

    deleteCourse: (chart, courseId) => {
        var url = `${API.url}/users/${User.username()}/charts/${chart}/${courseId}`;
        var request = API.newRequest('POST', url)

        request.done(function(response) {
            console.log("Course Deleted!", response);
        });

        request.fail(function(response) {
            console.log(response);
        });
    },

    getCoursesByDepartment: () => {

    },

    getCourseByCatalog: () => {

    },

    newRequest: (type, url, contentType, data, beforeSend) => {
        return $.ajax({
            type: type,
            url: url,
            contentType: contentType,
            data: data,
            beforeSend: beforeSend
        });
    }
}

function postChart(major, chartName) {
    var username = userConfig.username.split('-')[1];
    var url = `${apiURL}users/${username}/import`;
    var data = JSON.stringify({
        "target": major,
        "year": "15-17",
        "destination": chartName
    });
    var request = $.post({
        contentType: 'application/json',
        url: url,
        data: data
    });

    request.done(function(response) {
        console.log("Success!", response);
        sendUserConfig(chartName);
    });

    request.fail(function(response) {
        console.log(response);
    });
}

function deleteActiveChart() {
    if (userConfigExists()) {
        var username = userConfig.username.split('-')[1];
        var chart = userConfig.active_chart;
        var url = `${apiURL}users/${username}/charts/${chart}`;
        var request = $.ajax({
            type: 'DELETE',
            url: url,
            success: function(result) {
                console.log(result);
                userConfig = result;
                localStorage.userConfig = JSON.stringify(userConfig);
                $(".welcome-container").show();
                $(".header-title").text('Welcome');
                Menu.open();
            }
        });
    } else {
        var activeChart = guestConfig.active_chart;
        guestConfig.active_chart = null;
        delete guestConfig.charts[activeChart];
        localStorage.guestConfig = JSON.stringify(guestConfig);
        $(".welcome-container").show();
        $(".header-title").text('Welcome');
        Menu.open();
    }
}
