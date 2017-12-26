var API = {
    url: '/api/cpslo',

    authorize: (username, password, header, remember) => {
        var beforeSend = function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + header);
            $("#submit-progress").removeClass("hidden");
        }
        var options = {
            type: 'POST',
            url: `${API.url}/authorize`,
            contentType: 'application/json',
            beforeSend: beforeSend,
            data: remember,
        };

        API.newRequest(options)
            .done(function(config) {
                var guestConfig = User.data();
                if (guestConfig.charts && guestConfig.username === 'cpslo-guest') {
                    var username = config.username.split('-')[1];
                    config.active_chart = guestConfig.active_chart;

                    $.each(guestConfig.charts, function(key, value) {
                        API.importChart(value, key, username, true);
                        config.charts[key] = value;
                    });
                    User.logged_in = false;
                } else {
                    User.logged_in = true;
                }
                User.update(config);
                Menu.init();
            });
    },

    logout: () => {
        var options = {
            type: 'POST',
            url: `${API.url}/users/${User.username()}/logout`,
        };

        API.newRequest(options)
            .done(function() {
                User.remove();
            });
    },

    stockCharts: () => {

    },

    importChart: (major, name, username, login) => {
        console.log(`Major: ${major}, Name: ${name}`);
        username = username ? username : User.username();
        var options = {
            type: 'POST',
            url: `${API.url}/users/${username}/import`,
            contentType: 'application/json',
            data: JSON.stringify({
                "target": major,
                "year": "15-17",
                "destination": name
            }),
        };

        API.newRequest(options)
            .done(function(response) {
                if (!login) {
                    Menu.init();
                }
            }).fail(function(response) {
                console.log(response);
            });
    },

    loginStatus: () => {
        var options = {
            type: 'GET',
            url: `${API.url}/users/${User.username()}`,
        };

        API.newRequest(options)
            .done(function(response) {
                User.logged_in = true;
                Chart.init();
                Menu.init();
            }).fail(function(response) {
                if (response.responseJSON.message === "User tvillare at school cpslo is successfully authenticated for this endpoint") {
                    User.logged_in = true;
                    Chart.init();
                    Menu.init();
                } else {
                    User.logged_in = false;
                }
            });
    },

    getUserConfig: () => {
        var options = {
            type: 'GET',
            url: `${API.url}/users/${User.username()}/config`,
        }

        API.newRequest
            .done(function(config) {
                console.log('hi');
                User.logged_in = true;
                User.update(config);
                $("#login-button").addClass('hidden');
                $("#logout-button").removeClass("hidden");
            });
    },

    updateUserConfig: (newConfig) => {
        var username = newConfig.username.split('-')[1];
        var options = {
            type: 'POST',
            url: `${API.url}/users/${username}/config`,
            contentType: 'application/json',
            data: JSON.stringify(newConfig),
        };

        API.newRequest(options)
            .done(function(response) {
                Chart.init();
            });
    },

    userCharts: () => {

    },

    addCourseToChart: () => {
        /*
        if (User.logged_in) {
            var chart = User.getActiveChart();
            var contentType = 'application/json';
            var request = API.newRequest('POST', `${API.url}/users/${User.username()}/charts`, contentType);
        }
        */
    },

    deleteChart: (name) => {
        var options = {
            type: 'DELETE',
            url: `${API.url}/users/${User.username()}/charts/${name}`
        };
        var request = API.newRequest(options);
    },

    getCourseById: () => {

    },

    updateCourse: data => {
        var id = data._id;
        var options = {
            type: 'PUT',
            url: `${API.url}/users/${User.username()}/charts/${User.getActiveChart()}/${id}`,
            contentType: 'application/json',
            data: JSON.stringify(data),
        }
        console.log(data);
        API.newRequest(options)
            .done(function(response) {
                console.log("Course Updated!", response);
            }).fail(function(response) {
                console.log(response);
            });
    },

    deleteCourse: (chart, courseId) => {
        var options = {
            type: 'DELETE',
            url: `${API.url}/users/${User.username()}/charts/${chart}/${courseId}`,
        };
        API.newRequest(options)
            .done(function(response) {
                console.log("Course Deleted!", response);
            }).fail(function(response) {
                console.log(response);
            });
    },

    getCoursesByDepartment: () => {

    },

    getCourseByCatalog: () => {

    },

    newRequest: options => {
        return $.ajax({
            type: options.type,
            url: options.url,
            contentType: options.contentType,
            data: options.data,
            beforeSend: options.beforeSend,
        });
    },
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
