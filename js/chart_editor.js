var timeoutId;
var isLongPress = false;

var ChartEditor = {
    select: blockId => {
        $(blockId).toggleClass("selected-block");

        $("#selected-count-container").text(`${ChartUpdater.countSelectedBlocks()} selected`);
    },

    setTapCounter: (block) => {
        timeoutId = setTimeout(function(){
            ChartEditor.select(block);
            isLongPress = true;
        }, 400);
    },

    determineBlockAction: (block, name, catalog, desc, prereqs, units, course_type) => {
        clearTimeout(timeoutId);
        if ($('.base').hasClass('base-editing')) {
            ChartEditor.select(block);
        } else if (!$(block).hasClass('multi-block') && !$(block).hasClass('elective-block')) {
            Chart.displayPopup(name, catalog, desc, prereqs, units, course_type);
        } else {
            Chart.displayPopup(name, catalog, desc, prereqs, units, course_type);
        }
    },

    replaceBlock: (blockId, courseUrl) => {
        var request = $.get({
            url: `${apiURL}courses/${courseUrl}`
        });

        request.done(function(data) {
            var block = $('#'+blockId);
            console.log(block);
            block.parent().removeClass('multi-block elective-block');
            block.html(newBlockCourseDataView(data));
            block.attr("id", data._id);
            block.parent().removeClass('selected-block');
        });
        Menu.init();
        closeMenu();
    },

    deleteSelectedBlocks: () => {
        var selectedBlocks = $(".selected-block");
        var id = selectedBlocks.children(".block").attr("id");
        selectedBlocks.css({
            visibility: 'hidden',
            display: 'block'
        }).slideUp("fast", function() {
//            deleteCourse(id);
            selectedBlocks.remove();
            selectedBlocks.removeClass('selected-block');
            ChartUpdater.countSelectedBlocks();
        });
    },

    clearSelectedBlocks: () => {
        $('.selected-block').removeClass('selected-block');
        ChartUpdater.countSelectedBlocks();
    },

    changeBlockColor: (colorItem) => {
        var colorClass = $(colorItem).attr("id");
        var selectedBlocks = $(".selected-block .block");
        var colorPalette = $(".color-palette");

        selectedBlocks.removeClass("general-ed support free-class concentration major minor");
        selectedBlocks.addClass(colorClass);
        colorPalette.addClass("hidden");
    },

    markComplete: (id) => {
        $(id).addClass('mark-complete');
    },

    toggleEditMode: () => {
        if ($('.base').hasClass('base-editing')) {
            ChartEditor.view();
        } else {
            ChartEditor.edit();
        }
    },

    edit: () => {
        var chartContainer = $(".base");
        var block = $(".block-outline");
        $('#send-to-pp-button').addClass('edit-action-button');
        $('.menu-modal').children().css('opacity', '0');
        $('.edit-icon').addClass('hidden');
        $('.check-icon').removeClass('hidden');
        closeMenu();

        if (!chartContainer.hasClass("base-editing")) {
            block.removeClass("show-block");
            chartContainer.addClass("base-editing");
            setupSortable(".block-outline",  ".block-option-container, .delete-block, .quarter-head, .edit-block-button", ".quarter, .block-drop");
            $(".chart-menu-open-button").addClass('hidden');
            $(".menu-nav-buttons").hide();
            $(".edit-container").fadeIn("fast");
        }

        ChartUpdater.countSelectedBlocks();
        ChartUpdater.countUnits();
    },

    view: () => {
        var chartContainer = $(".base");
        $('.menu-modal').children().css('opacity', '1');
        chartContainer.removeClass("base-editing");
        $(".selected-block").removeClass("selected-block");
        $(".menu-nav-buttons").fadeIn();
        $(".edit-container").fadeOut("fast");
        $(".chart-menu-open-button").removeClass('hidden');
        $('.edit-icon').removeClass('hidden');
        $('.check-icon').addClass('hidden');

        emptyStack();

        $('.quarter').sortable('destroy');
        toggleColorPalette(true);
        toggleFlagPalette(true);
    },

    enableEditButtons: () => {
        $('.edit-action-button').addClass('clickable');
    },

    disableEditButtons: () => {
        $('.edit-action-button').removeClass('clickable');
    }
}

var ChartUpdater = {
    checkCompletion: () => {
        var foundCurrent = false;
        var currentValue = $('.current-quarter').attr('value');

        $('.block-outline').removeClass('mark-complete mark-in-progress');
        $('.quarter').each(function(index) {
            if ($(this).hasClass('current-quarter')) {
                foundCurrent = true;
                $(this).find('.block-outline').addClass('mark-in-progress');
            }
            if (!foundCurrent) {
                $(this).find('.block-outline').addClass('mark-complete');
            }

        });
    },

    countSelectedBlocks: () => {
        var count = $(".selected-block").length;

        if (count > 0) {
            ChartEditor.enableEditButtons();
        } else {
            ChartEditor.disableEditButtons();
        }

        $('#selected-count-container').text(`${count} selected`);

        return count;
    },

    countUnits: () => {
        var unitCount;
        var value;
        completedGECount = 0;
        completedSupportCount = 0;
        completedMajorCount = 0;

        $(".quarter").each(function() {
            unitCount = 0;
            var blocks = $(this).children(".block-outline").children(".block");
            blocks.each(function() {
                value = parseInt($(this).attr("value"));
                if (value) {
                    unitCount += value;
                    if ($(this).hasClass("general-ed mark-complete")) {
                        completedGECount += value;
                    } else if ($(this).hasClass("support mark-complete")) {
                        completedSupportCount += value;
                    } else if ($(this).hasClass("major mark-complete")) {
                        completedMajorCount += value;
                    }
                }
            });
            $(this).children(".quarter-head").children(".quarter-unit-count").text(`${unitCount} units`);
        });

        $("#ge-count").text("GE's: " + completedGECount);
        $("#support-count").text("Support: " + completedSupportCount);
        $("#major-count").text("Major: " + completedMajorCount);
    },

    getStartYear: () => {
        if (userConfigExists()) {
            return userConfig.start_year;
        } else if (localStorage.guestConfig) {
            var config = JSON.parse(localStorage.guestConfig);
            return config.start_year;
        }
        return 2015;
    }
}

function openCourseSelector(block) {
    var id = $(block).attr("id");
    emptyStack();
    changeWindow("department-selector", "Departments", id) ;
    setupAutocomplete('department-search');
    openMenu();
    disableChart();
    $(".block").removeClass('replaceable');
    $(block).addClass('replaceable');
}

function disableChart() {
    $('.disabled').show();
}

function enableChart() {
    $('.disabled').hide();
}

function openMultiCourseSelector(block) {
    emptyStack();
    openMenu();
    disableChart();
    var id = $(block).attr("id");
    var courseList = [];
    courseList.push(id);
    $("#" + id + " .course-catalog-title").each(function() {
        courseList.push($(this).text());
    });

    changeWindow('multi-course-selector', "Choose a Course", courseList);
}

function setupSortable(items, cancel, connectWith) {
    $(".quarter").sortable({
        items: items,
        cancel: cancel,
        connectWith: connectWith,
        tolerance: 'pointer',

        start: function(e, ui) {
            $(this).sortable('instance').offset.click = {
                left: Math.floor(ui.helper.width() / 2),
                top: Math.floor(ui.helper.height() / 2)
            }
        },

        helper: function (event, item) {
            item.addClass('selected-block');
            item.removeClass('mark-complete mark-in-progress show-block');
            var $helper = $("<div class='sortable-helper'></div>");
            var selected = $(".selected-block");
            var $cloned = selected.clone();
            $helper.append($cloned);
            selected.hide();
            item.data("multi-sortable", $cloned);
            ChartEditor.edit();

            return $helper;
        },

        stop: function (event, ui) {
            var $cloned = ui.item.data("multi-sortable");
            $cloned.addClass('selected-block');
            ui.item.removeData("multi-sortable");
            ui.item.after($cloned);
            ui.item.siblings(":hidden").remove();
            ui.item.remove();
            $('.selected-block').removeClass('selected-block');
            ChartUpdater.checkCompletion();
            ChartUpdater.countUnits();
            ChartUpdater.countSelectedBlocks();
        },

        receive: function(e, ui) {
            ui.item.before(ui.item.data('items'));
        },
    }).disableSelection();
}

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function toggleColorPalette(toggleOff = false) {
    var colorPalette = $(".color-palette");
    var flagPalette = $(".flag-palette");

    if (colorPalette.hasClass("hidden")  && !toggleOff &&
        ChartUpdater.countSelectedBlocks() > 0) {
        colorPalette.removeClass("hidden");
    } else {
        colorPalette.addClass("hidden");
    }

    flagPalette.addClass("hidden");
}

function toggleFlagPalette(toggleOff = false) {
    var colorPalette = $(".color-palette");
    var flagPalette = $(".flag-palette");

    if (flagPalette.hasClass("hidden") && !toggleOff) {
        flagPalette.removeClass("hidden");
    } else {
        flagPalette.addClass("hidden");
    }
    colorPalette.addClass("hidden");
}

function popupCourseInfo(title, description, prereqs, dept, num) {
    var element =
        `<div class="popup-message z-depth-5">
            <h2 class="popup-title">${title}</h2>
            <div class="popup-description-container">
                <h3 class="popup-body">`+description+`</h3>
            </div>
            <h4 class="popup-ps">Prereqs: ${prereqs ? prereqs : "none"}</h4>
            <div class="popup-button-container">
                <h4 class="close-popup-message" onclick="closePopupMessage()">Okay</h4>
                <h4 class="close-popup-message" onclick="window.open('http://polyratings.com/search.php?type=Class&terms=${dept}+${num}&format=long&sort=rating');">PolyRatings</h4>
            </div>
         </div>`;
    if (!$('.base').hasClass('base-editing')) {
        $(".popup-disabled").show();
        $("body").append(element);
    }
}

function addBlockFlag(flagId) {
    var selectedBlocks = $(".selected-block");

    selectedBlocks.removeClass("mark-complete mark-retake mark-next-quarter mark-in-progress");
    selectedBlocks.each(function(key, block) {
        block = $(block).children(".block");
        var blockId = block.attr("id");
        var flagOption = flagId.replace(/[0-9]/g, '');
        var courseType = block.attr("data-courseType");
        var value = parseInt(block.attr("value"));
        var flag = {id: blockId, flag: flagOption, courseType: courseType, value: value};

        checkExistingFlag(block, flagOption, flag);
        $(this).addClass(flagId);
    });
    displayFlagMessage(flagId, false);
    toggleFlagPalette(true);
}

function toggleChartMenu() {
    var chartMenu = $(".chart-menu");
    var openChartMenuButton = $(".chart-menu-open-button");
    if (chartMenu.hasClass('hidden')) {
        chartMenu.removeClass('hidden');
        openChartMenuButton.addClass('active-button');
    } else {
        closeChartEditMenu();
        openChartMenuButton.removeClass('active-button');
    }
}
