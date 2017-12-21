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
