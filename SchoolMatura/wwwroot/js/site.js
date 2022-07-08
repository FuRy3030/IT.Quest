$('#Logo').on('click', function () {
    window.location.href = "/Home/Index";
});

$('#JoinTestHomeBox button').on('click', function(event) {
    event.preventDefault();
    console.log($(this).prev().val().trim());
    $.ajax({
        url: '/Home/IsCodeValid',
        type: 'POST',
        data: JSON.stringify({SessionIdentifier: $(this).prev().val().trim()}),
        contentType: 'application/json; charset=utf-8',
        success: function(response) {
            if (response == 'Success') {
                window.location.href = '/Testing/UserCredentials';
            }
            else {
                var ErrorModal = new bootstrap.Modal(document.getElementById('WrongUserCodeModal'));
                ErrorModal.show();
            }
        },
        error: function(err) {
            // Nothing
        }
    });
});

const $Dropdowns = $('.dropdown-menu');
$Dropdowns.each(function() {
    const Coordinates = $(this).prev()[0].getBoundingClientRect();
    $(this).css('left', `${Coordinates.left}px`);
});

function NavbarDataLoad() {
    $.ajax({
        url: '/Home/NavBarDataHandler',
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        success: function(data) {
            const Dropdown = document.getElementsByClassName('dropdown-my-materials')[0];
            const ParsedData = JSON.parse(data);

            ParsedData.Exercises.forEach(Exercise => {
                switch (Exercise.Type) {
                    case 'StandardExercise':
                        Exercise.Type = 'Zwykłe';
                        break;
                    case 'TrueFalseExercise':
                        Exercise.Type = 'Prawda / Fałsz';
                        break;
                    case 'ProgrammingExercise':
                        Exercise.Type = 'Programistyczne';
                        break;
                };

                const ExerciseShortcut = document.createElement('li');
                ExerciseShortcut.classList.add('exercise-navbar');
                ExerciseShortcut.classList.add('shortcut-navbar');
                ExerciseShortcut.style.display = 'none';
                ExerciseShortcut.innerHTML = `<i class="fa-regular fa-circle-question"></i> 
                <span class="title-navbar">${Exercise.Title}</span> 
                <span class="additional-info-navbar">${Exercise.Type}</span>`;

                Dropdown.append(ExerciseShortcut);
            });

            ParsedData.Sets.forEach(Set => {
                if (Set.ExercisesCount < 5) {
                    Set.ExercisesCount = `${Set.ExercisesCount} Pytania`;
                }
                else {
                    Set.ExercisesCount = `${Set.ExercisesCount} Pytań`;
                }

                const SetShortcut = document.createElement('li');
                SetShortcut.classList.add('set-navbar');
                SetShortcut.classList.add('shortcut-navbar');
                SetShortcut.innerHTML = `<i class="fa-regular fa-clone"></i> 
                <span class="title-navbar">${Set.Title}</span> 
                <span class="additional-info-navbar">${Set.ExercisesCount}</span>`;

                Dropdown.append(SetShortcut);

                SetShortcut.addEventListener('click', function() {
                    localStorage.setItem('CurrentSetToOpen', Set.Title);
                    window.location.href = '/SetOverview/Overview';
                });
            });

            const Divider = document.createElement('div');
            Divider.classList.add('divider');
            Divider.style.marginBottom = '1.5vh';
            Divider.style.marginTop = '2.5vh';

            Dropdown.append(Divider);

            const AllSetsButton = document.createElement('a');
            AllSetsButton.classList.add('show-all-navbar');
            AllSetsButton.classList.add('show-all-sets');
            AllSetsButton.innerHTML = `<i class="fa-solid fa-angle-right"></i> Pokaż Wszystkie Zestawy`;

            Dropdown.append(AllSetsButton);

            AllSetsButton.addEventListener('click', function() {
                window.location.href = '/Repository/UserRepository';
            });

            const AllExercisesButton = document.createElement('a');
            AllExercisesButton.classList.add('show-all-navbar');
            AllExercisesButton.classList.add('show-all-exercises');
            AllExercisesButton.innerHTML = `<i class="fa-solid fa-angle-right"></i> Pokaż Wszystkie Zadania`;
            AllExercisesButton.style.display = 'none';

            Dropdown.append(AllExercisesButton);

            AllExercisesButton.addEventListener('click', function() {
                window.location.href = '/Exercises/List';
            });

            NavbarCheckIfEmptySetsListNotificationNeeded();
        },
        error: function(err) {
            // Nothing
        }
    });
};

function NavbarCheckIfEmptyExercisesListNotificationNeeded() {
    const $NavbarExercisesShortcuts = $('.exercise-navbar');
    if ($NavbarExercisesShortcuts.length == 0) {
        $('#ExercisesNavbarEmpty').css('display', 'flex');
    }
    else {
        $('#ExercisesNavbarEmpty').css('display', 'none');
    }
};

function NavbarCheckIfEmptySetsListNotificationNeeded() {
    const $NavbarSetsShortcuts = $('.set-navbar');
    if ($NavbarSetsShortcuts.length == 0) {
        $('#SetsNavbarEmpty').css('display', 'flex');
    }
    else {
        $('#SetsNavbarEmpty').css('display', 'none');
    }
};

NavbarDataLoad();

jQuery(function() {
    const $DropdownHeaderButtons = $('.dropdown-navbar-header h4');

    $DropdownHeaderButtons.each(function() {
        $(this).on('click', function(event) {
            event.stopPropagation();
            if (!$(this).hasClass('dropdown-navbar-header-active')) {
                $DropdownHeaderButtons.each(function() {
                    $(this).removeClass('dropdown-navbar-header-active');
                });
                $(this).addClass('dropdown-navbar-header-active');
            }

            if ($(this).hasClass('show-sets')) {
                const $NavbarShortcuts = $('.shortcut-navbar');
                $NavbarShortcuts.each(function() {
                    if ($(this).hasClass('set-navbar')) {
                        $(this).css('display', 'flex');
                    }
                    else {
                        $(this).css('display', 'none');
                    }
                });

                $('.show-all-exercises').css('display', 'none');
                $('.show-all-sets').css('display', 'block');

                NavbarCheckIfEmptySetsListNotificationNeeded();
                $('#ExercisesNavbarEmpty').css('display', 'none');
            }
            else {
                const $NavbarShortcuts = $('.shortcut-navbar');
                $NavbarShortcuts.each(function() {
                    if ($(this).hasClass('exercise-navbar')) {
                        $(this).css('display', 'flex');
                    }
                    else {
                        $(this).css('display', 'none');
                    }
                });

                $('.show-all-exercises').css('display', 'block');
                $('.show-all-sets').css('display', 'none');

                NavbarCheckIfEmptyExercisesListNotificationNeeded();
                $('#SetsNavbarEmpty').css('display', 'none');
            }
        });
    });
});
