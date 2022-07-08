class DataManagement {
    static Exercises = [];
    static SelectedExercisesNumber = 0;

    static LoadExercises() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: `/Exercises/GetUserExercises`,
                type: 'GET',
                contentType: 'application/json; charset=utf-8',
                success: function(data) {
                    console.log(JSON.parse(data));
                    resolve(JSON.parse(data));
                },
                error: function(err) {
                    reject(err);
                }
            });
        });
    }

    static DeleteSelectedExercises(ExercisesIdentifiers) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/Exercises/DeleteExercises',
                type: 'POST',
                data: JSON.stringify(ExercisesIdentifiers),
                contentType: 'application/json; charset=utf-8',
                success: function(response) {
                    resolve(response);
                },
                error: function(err) {
                    reject(err);
                }
            });
        });
    }
}

class RenderContent {
    static RenderStandardExerciseShortcut(Title, Content, Points, Type, ShortContent, ID, BackgroundClass) {
        const Exercise = document.createElement('div');
        Exercise.classList.add('exercise-card');
        Exercise.setAttribute("data-identifier", ID);

        if (ShortContent != undefined) {
            Exercise.innerHTML = `<h3 class="info-header">
                <span>Rodzaj: ${Type}</span>
                <span>Punkty: ${Points}</span>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox">
                    <label class="form-check-label header-label">
                        Nie zaznaczono
                    </label>
                </div>
            </h3>
            <h1 class="header">${Title}</h1>
            <p class="content">${ShortContent}</p>
            <button class="show-more-button">Pokaż Więcej <i class="fa-solid fa-eye"></i></button>
            <button class="show-less-button">Pokaż Mniej <i class="fa-solid fa-eye-slash"></i></button>`;
        }
        else {
            Exercise.innerHTML = `<h3 class="info-header">
                <span>Rodzaj: ${Type}</span>
                <span>Punkty: ${Points}</span>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox">
                    <label class="form-check-label header-label">
                        Nie zaznaczono
                    </label>
                </div>
            </h3>
            <h1 class="header">${Title}</h1>
            <p class="content">${Content}</p>`;
        }

        const ExerciseList = document.getElementById('ExercisesList');
        ExerciseList.append(Exercise);
        Exercise.classList.add(BackgroundClass);
    }

    static RenderTrueFalseExerciseShortcut(Title, Content, Points, Type, ShortContent, ID, BackgroundClass) {
        const $FoundExercise = $('#ExercisesList').find(`[data-identifier='${ID}']`);
        if ($FoundExercise.length !== 0) {
            let CurrentPoints = parseInt($FoundExercise.find('.info-header span').last().text().substring(8));
            CurrentPoints = CurrentPoints + Points;
            $FoundExercise.find('.info-header span').last().text(`Punkty: ${CurrentPoints}`);
        }

        if ($FoundExercise.length !== 0 && $FoundExercise.children('button').length == 0) {
            const CurrentNewContent = $FoundExercise.children('p').html() + '</br>' + Content;
            if (CurrentNewContent.length > 250) {
                $FoundExercise.children('p').html(CurrentNewContent.substring(0, 250) + '...');
                $FoundExercise.append(`<button class="show-more-button-true-false">Pokaż Więcej <i class="fa-solid fa-eye"></i></button>`);
                $FoundExercise.append(`<button class="show-less-button-true-false">Pokaż Mniej <i class="fa-solid fa-eye-slash"></i></button>`);
            }
        }
        else if ($FoundExercise.length == 0) {
            const Exercise = document.createElement('div');
            Exercise.classList.add('exercise-card');
            Exercise.setAttribute("data-identifier", ID);

            if (ShortContent != undefined) {
                Exercise.innerHTML = `<h3 class="info-header">
                    <span>Rodzaj: ${Type}</span>
                    <span>Punkty: ${Points}</span>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox">
                        <label class="form-check-label header-label">
                            Nie zaznaczono
                        </label>
                    </div>
                </h3>
                <h1 class="header">${Title}</h1>
                <p class="content">1. ${ShortContent}</p>
                <button class="show-more-button-true-false">Pokaż Więcej <i class="fa-solid fa-eye"></i></button>
                <button class="show-less-button-true-false">Pokaż Mniej <i class="fa-solid fa-eye-slash"></i></button>`;
            }
            else {
                Exercise.innerHTML = `<h3 class="info-header">
                    <span>Rodzaj: ${Type}</span>
                    <span>Punkty: ${Points}</span>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox">
                        <label class="form-check-label header-label">
                            Nie zaznaczono
                        </label>
                    </div>
                </h3>
                <h1 class="header">${Title}</h1>
                <p class="content">1. ${Content}</p>`;
            }

            const ExerciseList = document.getElementById('ExercisesList');
            ExerciseList.append(Exercise);
            Exercise.classList.add(BackgroundClass);
        }
    }

    static RenderSetExerciseShortcut(Type, Title, Code) {
        const ExerciseShortcut = document.createElement('div');
        ExerciseShortcut.classList.add('set-exercise-shortcut');
        ExerciseShortcut.setAttribute("data-identifier", Code);
        
        switch (Type) {
            case 'Programistyczne':
                ExerciseShortcut.innerHTML = `<img src="/images/programming-shortcut-icon.png" alt="-" />
                    <h4>${Title}</h4>`;
                break;
            case 'Zwykłe Otwarte':
                ExerciseShortcut.innerHTML = `<img src="/images/standard-shortcut-icon.png" alt="-" />
                    <h4>${Title}</h4>`;
                break;
            case 'Prawda / Fałsz':
                ExerciseShortcut.innerHTML = `<img src="/images/true-false-shortcut-icon.png" alt="-" />
                    <h4>${Title}</h4>`;
                break;
        }

        const ExerciseShortcutList = document.getElementById('SetExercisesList');
        ExerciseShortcutList.append(ExerciseShortcut);
    }

    static ShowErrorModal(modalBody) {
        var ErrorModal = new bootstrap.Modal(document.getElementById('ErrorModal'));
        $('#ErrorModal .modal-body p').text(modalBody);
        ErrorModal.toggle();
    }
}

class DynamicEventListeners {
    static CreateShowingButtonsListeners() {
        $('.show-more-button').each(function() {
            $(this).on('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                const ExerciseID = $(this).parent().data('identifier');
                const FoundExercise = DataManagement.Exercises.find(Exercise => {
                    return Exercise.ID == ExerciseID;
                });

                $(this).siblings('p').text(FoundExercise.ParsedContent);
                $(this).siblings('.show-less-button').css('display', 'block');
                $(this).css('display', 'none');
            });
        });

        $('.show-less-button').each(function() {
            $(this).on('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                const ExerciseID = $(this).parent().data('identifier');
                const FoundExercise = DataManagement.Exercises.find(Exercise => {
                    return Exercise.ID == ExerciseID;
                });
                
                $(this).siblings('p').text(FoundExercise.ShortenedContent);
                $(this).siblings('.show-more-button').css('display', 'block');
                $(this).css('display', 'none');
            });
        });
    }

    static CreateShowingButtonsListenersForTrueFalseExercises() {
        $('.show-more-button-true-false').each(function() {
            $(this).on('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                $(this).siblings('p').html('');
                const ExerciseID = $(this).parent().data('identifier');
                const FoundExercises = DataManagement.Exercises.filter(Exercise => {
                    return Exercise.ID == ExerciseID;
                });

                FoundExercises.forEach(FoundExercise => {
                    const CurrentContent = $(this).siblings('p').html();
                    if (CurrentContent != '') {
                        $(this).siblings('p').html(CurrentContent + '</br>' + FoundExercise.ParsedContent);
                    }
                    else {
                        $(this).siblings('p').html(FoundExercise.ParsedContent);
                    }
                });

                $(this).siblings('.show-less-button-true-false').css('display', 'block');
                $(this).css('display', 'none');
            });
        });

        $('.show-less-button-true-false').each(function() {
            $(this).on('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                const ExerciseID = $(this).parent().data('identifier');
                const FoundExercises = DataManagement.Exercises.filter(Exercise => {
                    return Exercise.ID == ExerciseID;
                });

                FoundExercises.forEach(FoundExercise => {
                    const CurrentContent = $(this).siblings('p').html();
                    const CurrentNewContent = CurrentContent + '</br>' + FoundExercise.ParsedContent;
                    if (CurrentNewContent.length > 250) {
                        $(this).siblings('p').html(CurrentNewContent.substring(0, 250) + '...');
                        return false;
                    }
                });
                
                $(this).siblings('.show-more-button-true-false').css('display', 'block');
                $(this).css('display', 'none');
            });
        });
    }

    static CreateSelectEvent() {
        $('.info-header .form-check input').each(function() {
            $(this).on('change', function() {
                if (this.checked) {
                    $(this).next().html('Zaznaczono');
                    $(this).next().css('color', '#4834d4');
                    $(this).closest('.exercise-card').addClass('exercise-card-selected');

                    const ExerciseCode = $(this).closest('.exercise-card').data('identifier');
                    const Title = $(this).closest('.exercise-card').find('.header').text();
                    const Type = $(this).parent().prev().prev().text().substring(8);
                    RenderContent.RenderSetExerciseShortcut(Type, Title, ExerciseCode);

                    DataManagement.SelectedExercisesNumber = DataManagement.SelectedExercisesNumber + 1;
                    UpdateBottomNavbarCounter(DataManagement.SelectedExercisesNumber);
                    CheckShortcutsEmptyListNotificationDisplay();
                }
                else {
                    $(this).next().html('Nie zaznaczono');
                    $(this).next().css('color', '#92939b');
                    $(this).closest('.exercise-card').removeClass('exercise-card-selected');

                    const ExerciseCode = $(this).closest('.exercise-card').data('identifier');
                    $('#SetExercisesList').children().each(function() {
                        if ($(this).data('identifier') == ExerciseCode) {
                            $(this).remove();
                        }
                    });

                    DataManagement.SelectedExercisesNumber = DataManagement.SelectedExercisesNumber - 1;
                    UpdateBottomNavbarCounter(DataManagement.SelectedExercisesNumber);
                    CheckShortcutsEmptyListNotificationDisplay();
                }
            });
        });
    }
}

function CheckEmptyListNotificationDisplay() {
    let isListEmpty = true;
    const $ExercisesShortcuts = $('.exercise-card');
    $ExercisesShortcuts.each(function() {
        if ($(this).css('display') == 'flex') {
            isListEmpty = false;
            return false;
        }
    });

    if (isListEmpty == true) {
        $('#ExercisesEmptyList').css('display', 'flex');
        $('#ExercisesList').css('display', 'none');
    }
    else {
        $('#ExercisesEmptyList').css('display', 'none');
        $('#ExercisesList').css('display', 'flex');
    }
}

function CheckShortcutsEmptyListNotificationDisplay() {
    if ($('#SetExercisesList').children().length > 0) {
        $('#NewSetShortcutsEmptyList').css('display', 'none');
        $('#SetExercisesList').css('display', 'flex');
    }
    else {
        $('#NewSetShortcutsEmptyList').css('display', 'flex');
        $('#SetExercisesList').css('display', 'none');
    }
}

function UpdateBottomNavbarCounter(Counter) {
    if (Counter > 1 && Counter < 5) {
        $('#SubNavBar h2')
            .html(`Zaznaczyłeś / zaznaczyłaś <span>${Counter}</span> zadania`);
    }
    else if (Counter == 1) {
        $('#SubNavBar h2')
            .html(`Zaznaczyłeś / zaznaczyłaś <span>${Counter}</span> zadanie`);
    }
    else if (Counter == 0) {
        $('#SubNavBar h2')
            .html(`Nie zaznaczyłeś / zaznaczyłaś <span>żadnego</span> zadania`);
    }
    else {
        $('#SubNavBar h2')
            .html(`Zaznaczyłeś / zaznaczyłaś <span>${Counter}</span> zadań`);
    }
}

async function InitialLoad() {
    DataManagement.Exercises = await DataManagement.LoadExercises();
    DataManagement.Exercises.forEach(Exercise => {
        Exercise.ParsedContent = Exercise.Content.replaceAll(/<.*?>/gim, ' ');
        if (Exercise.ParsedContent.length > 250) {
            Exercise.ShortenedContent = Exercise.ParsedContent.substring(0, 250) + '...';
        }

        switch (Exercise.Type) {
            case 'StandardExercise':
                Exercise.Type = 'Zwykłe Otwarte';
                Exercise.BackgroundClass = 'standard';
                break;
            case 'ProgrammingExercise':
                Exercise.Type = 'Programistyczne';
                Exercise.BackgroundClass = 'programming';
                break;
            case 'TrueFalseExercise':
                Exercise.Type = 'Prawda / Fałsz';
                Exercise.BackgroundClass = 'true-false';
                break;
        }

        if (Exercise.Type != 'Prawda / Fałsz') {
            RenderContent.RenderStandardExerciseShortcut(Exercise.Title, Exercise.ParsedContent, 
                Exercise.Points, Exercise.Type, Exercise.ShortenedContent, Exercise.ID, Exercise.BackgroundClass);
        }
        else {
            RenderContent.RenderTrueFalseExerciseShortcut(Exercise.Title, Exercise.ParsedContent, 
                Exercise.Points, Exercise.Type, Exercise.ShortenedContent, Exercise.ID, Exercise.BackgroundClass);
        }
    });

    DynamicEventListeners.CreateShowingButtonsListeners();
    DynamicEventListeners.CreateShowingButtonsListenersForTrueFalseExercises();
    DynamicEventListeners.CreateSelectEvent();
    CheckEmptyListNotificationDisplay();

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
    });
}

InitialLoad();

jQuery(function() {
    const Checkboxes = document.querySelectorAll('input[type=checkbox]');
    [].forEach.call(Checkboxes, function (Checkbox) {
        Checkbox.checked = Checkbox.defaultChecked;
    });

    const $UpperNavbar = $('.navbar');
    const $BottomNavbar = $('#SubNavBar');
    const $StickyPanel = $('#SetPanelCreator');
    const $SearchBarInput = $('.complex-input-shared input');
    const $GroupingSelectors = $('.grouping-selector');
    const $DeleteButton = $('#SubNavBar button').first();
    const $EditButton = $('#SubNavBar button').first().next();
    const $NewSetButton = $('#SubNavBar button').last();

    const UpperNavbarHeight = $UpperNavbar.outerHeight();
    $BottomNavbar.css('top', `${UpperNavbarHeight}px`);
    const WholeNavbarHeight = $UpperNavbar.outerHeight() + $BottomNavbar.outerHeight(true);
    $StickyPanel.css('top', `${WholeNavbarHeight}px`);

    $SearchBarInput.on('keyup', function(event) {
        const $ShortcutTitles = $('.exercise-card .header');
        $ShortcutTitles.each(function() {
            if ($(this).text().toLowerCase().includes(event.target.value.toLowerCase())) {
                $(this).parent().css('display', 'flex');
            }
            else {
                $(this).parent().css('display', 'none');
            }
        });
        CheckEmptyListNotificationDisplay();
    });

    $GroupingSelectors.each(function() {
        $(this).on('click', function() {
            if (!$(this).hasClass('grouping-selector-active')) {
                $GroupingSelectors.removeClass('grouping-selector-active');
                $(this).addClass('grouping-selector-active');

                const $Shortcuts = $('.exercise-card');
                switch($(this).text().trim()) {
                    case 'Wszystkie': 
                        $Shortcuts.each(function() {
                            $(this).css('display', 'flex');
                        });
                        CheckEmptyListNotificationDisplay();
                        break;
                    case 'Zwykłe': 
                        $Shortcuts.each(function() {
                            if ($(this).find('.info-header span').first().text() == 'Rodzaj: Zwykłe Otwarte') {
                                $(this).css('display', 'flex');
                            }
                            else {
                                $(this).css('display', 'none');
                            }
                        });
                        CheckEmptyListNotificationDisplay();
                        break;
                    case 'Programistyczne': 
                        $Shortcuts.each(function() {
                            if ($(this).find('.info-header span').first().text() == 'Rodzaj: Programistyczne') {
                                $(this).css('display', 'flex');
                            }
                            else {
                                $(this).css('display', 'none');
                            }
                        });
                        CheckEmptyListNotificationDisplay();
                        break;
                    case 'Prawda / Fałsz': 
                        $Shortcuts.each(function() {
                            if ($(this).find('.info-header span').first().text() == 'Rodzaj: Prawda / Fałsz') {
                                $(this).css('display', 'flex');
                            }
                            else {
                                $(this).css('display', 'none');
                            }
                        });
                        CheckEmptyListNotificationDisplay();
                        break;
                }
            }
        });
    });

    $DeleteButton.on('click', function(event) {
        event.preventDefault();
        let IdentifiersList = [];
        const $SelectedExercises = $('.exercise-card-selected');

        $SelectedExercises.each(function() {
            IdentifiersList.push($(this).data('identifier'));
        });

        DataManagement.DeleteSelectedExercises(IdentifiersList).then(response => {
            if (response == 'Success') {
                $SelectedExercises.each(function() {
                    IdentifiersList.forEach(Identifier => {
                        const $SetExerciseShortcut = $("#SetExercisesList").find(`[data-identifier='${Identifier}']`);
                        $SetExerciseShortcut.remove();
                    });
                    $(this).remove();
                });
            }
        });

        CheckEmptyListNotificationDisplay();
        CheckShortcutsEmptyListNotificationDisplay();
        UpdateBottomNavbarCounter($('#ExercisesList').children('.exercise-card-selected').length - 1);
        var DeleteButtonHTML = $DeleteButton[0];
        var Tooltip = bootstrap.Tooltip.getInstance(DeleteButtonHTML);
        Tooltip.hide();
    });

    $EditButton.on('click', function(event) {
        event.preventDefault();
        let Identifier = '';
        const $SelectedExercises = $('.exercise-card-selected');

        if ($SelectedExercises.length == 1) {
            Identifier = $SelectedExercises.data('identifier');
            window.location.href = `/Exercises/Edit?Identifier=${Identifier}`;
        }
        else {
            RenderContent.ShowErrorModal(`Zaznaczono więcej lub mniej niż jedno zadanie! Możesz edytować tylko pojedyńcze zadanie w danym momencie. Wybierz jedno i spróbuj ponownie.`);
        }

        var EditButtonHTML = $EditButton[0];
        var Tooltip = bootstrap.Tooltip.getInstance(EditButtonHTML);
        Tooltip.hide();
    });

    $NewSetButton.on('click', function(event) {
        event.preventDefault();
        let IdentifiersList = [];
        const $SetExercisesShortcuts = $('.set-exercise-shortcut');
        
        $SetExercisesShortcuts.each(function() {
            IdentifiersList.push($(this).data('identifier'));
        }); 

        const QueryStringObject = {
            Identifiers: IdentifiersList
        };  

        const QueryExercisesList = new URLSearchParams(QueryStringObject).toString();
        window.location.href = `/Exercises/NewSet?${QueryExercisesList}`;
    });

    $(function() {
        $('#SetExercisesList').sortable({
            update: function(event, ui) {
                // Sortable UI
            }
        });
    });
});