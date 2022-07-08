class DataManagement {
    static ConfigProtocol = '';

    static LoadGivenSet() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/SetOverview/LoadGivenSet',
                type: 'POST',
                data: JSON.stringify({Title: localStorage.getItem('CurrentSetToOpen')}),
                contentType: 'application/json; charset=utf-8',
                success: function(data) {
                    resolve(JSON.parse(data));
                },
                error: function(err) {
                    reject(err);
                }
            });
        });
    }

    static LoadSessionLinkData() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/SetOverview/LoadConfigElements',
                type: 'GET',
                success: function(FrontQueryString) {
                    console.log(FrontQueryString);
                    resolve(FrontQueryString);
                },
                error: function(err) {
                    reject(err);
                }
            });
        });
    }

    static UpdateTitle(oldTitle, newTitle) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/SetOverview/UpdateTitle',
                type: 'POST',
                data: JSON.stringify({
                    NewTitle: newTitle, 
                    OldTitle: oldTitle
                }),
                contentType: 'application/json; charset=utf-8',
                success: function(response) {
                    if (response == 'Success') {
                        localStorage.setItem('CurrentSetToOpen', newTitle);
                    }
                    alert('success');
                    resolve(JSON.parse(data));
                },
                error: function(err) {
                    alert('bad');
                    reject(err);
                }
            });
        });
    }

    static UpdateDescription(title, newDescription) {
        $.ajax({
            url: '/SetOverview/UpdateDescription',
            type: 'POST',
            data: JSON.stringify({
                SetTitle: title, 
                NewDescription: newDescription
            }),
            contentType: 'application/json; charset=utf-8',
            success: function(data) {
                console.log(data);
                alert('success');
            },
            error: function(err) {
                alert('bad');
            }
        });
    }

    static UpdateCurrentSession(title, dateStart, dateEnd, name) {
        $.ajax({
            url: '/SetOverview/AddNewSession',
            type: 'POST',
            data: JSON.stringify({
                SetTitle: title, 
                SessionName: name,
                SessionStartDate: dateStart,
                SessionEndDate: dateEnd         
            }),
            contentType: 'application/json; charset=utf-8',
            success: function(data) {
                $('#SessionName').val('');
                if (data.toString() == 'WrongDate') {
                    RenderContent.ShowErrorModal(`Wskazana data wygaśnięcia nie może być wcześniejsza niż obecna! Wybierz nową i spróbuj ponownie.`);
                }
                else if (data.toString() == 'WrongDateRelation') {
                    RenderContent.ShowErrorModal(`Wskazana data wygaśnięcia nie może być wcześniejsza niż data rozpoczęcia! Zmień daty i spróbuj ponownie.`);
                }
                else if (data.toString() == 'SessionExists') {
                    RenderContent.ShowErrorModal(`Sesja o tej samej nazwie i dacie już istnieje! Zmień nazwę lub datę i spróbuj ponownie.`);
                }
                else {
                    window.location.href = '/SetOverview/Overview';
                }
            },
            error: function(err) {
                // error
            }
        });
    }
}

class RenderContent {
    static CreateExerciseShortcut(type, content, points, hashtags, order, suborder = '') {
        const Exercise = document.createElement('li');
        Exercise.classList.add('exercise-shortcut');
        Exercise.innerHTML = `<div class="exercise-details">
            <h4 class="question-order">Zadanie ${order}.${suborder}</h4>
            <h4 class="question-points">Liczba Punktów: <span>${points}</span></h4>
            <h4 class="question-type">Rodzaj: <span>${type}</span></h4>
        </div>
        <div class="content">${content}</div>
        <div class="exercise-sub-details">
            <h4 class="question-hashtags">
                <i class="fa-solid fa-hashtag"></i> Hashtagi / Tagi: <span>${hashtags}</span>
            </h4>
        </div>`;

        const ExercisesList = document.getElementById('ExercisesList');
        ExercisesList.append(Exercise);
    }

    static CreateSessionShortcut(SessionName, SessionExpirationDateString, SessionIdentifier) {
        const SessionShortcut = document.createElement('li');
        SessionShortcut.classList.add('session-shortcut');
        SessionShortcut.innerHTML = `<i class="fa-solid fa-users-rays"></i>
        <div class="session-shortcut-details">
            <h6>${SessionName}</h6>
            <h6>${SessionExpirationDateString}</h6>
        </div>`;

        const SessionsList = document.getElementById('AllSessionsList');
        SessionsList.append(SessionShortcut);

        const GetGuidButton = document.createElement('button');
        GetGuidButton.classList.add('icon-button');
        GetGuidButton.setAttribute('data-identifier', SessionIdentifier);
        GetGuidButton.innerHTML = `<i class="fa-solid fa-lock"></i> Pokaż Kod Sesji`;

        SessionsList.append(GetGuidButton);

        $(GetGuidButton).on('click', function(event) {
            event.preventDefault();
            $('#SubNavBar h2').html(
                `<span class="line">
                    Kod Sesji: 
                    <span data-bs-toggle="tooltip" data-bs-placement="bottom" class="copy-element"
                        title="(Aby skopiować kliknij) Podaj ten identyfikator swoim uczniom aby mogli rozwiązać udostępniony przez Ciebie zestaw zadań.">
                        ${GetGuidButton.getAttribute('data-identifier')}
                    </span>
                    <i class="fa-solid fa-clipboard-check"></i>
                </span>
                <span class="line">
                    Link Do Sesji: 
                    <span data-bs-toggle="tooltip" data-bs-placement="bottom" class="copy-element"
                        title="(Aby skopiować kliknij) Podaj ten link swoim uczniom aby mogli rozwiązać udostępniony przez Ciebie zestaw zadań.">
                        ${DataManagement.ConfigProtocol}/Testing/UserCredentials?Id=${GetGuidButton.getAttribute('data-identifier')}
                    </span>
                    <i class="fa-solid fa-clipboard-check"></i>
                </span>`
            );

            $('#SubNavBar h2 .copy-element').on('click', function(event) {
                event.preventDefault();
                (async () => {
                    await navigator.clipboard.writeText($(this.text()));
                })();
            });

            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl)
            });
        });
    }

    static CreateRecentSession(SessionDate, SessionTime) {
        const RecentSession = document.createElement('li');
        RecentSession.classList.add('session-shortcut');
        RecentSession.innerHTML = `<i class="fa-solid fa-calendar-days sessions-shortcuts-big-icon"></i>
        <h5 class="sessions-shortcuts-text sessions-shortcuts-text-small">${SessionTime}</br>${SessionDate}</h5>`;

        const RecentSessionsList = document.getElementById('RecentSessionsList');
        RecentSessionsList.append(RecentSession);
    }

    static CreateStudentResultShortcut(FirstName, LastName, SubmissionDate, TestTakerIdentifier) {
        const ResultShortcut = document.createElement('li');
        ResultShortcut.classList.add('result-shortcut');
        ResultShortcut.innerHTML = `<i class="fa-solid fa-user-graduate"></i>
        <div class="result-shortcut-details">
            <h6>${FirstName} ${LastName}</h6>
            <h6>${SubmissionDate}</h6>
        </div>`;

        const ResultsList = document.getElementById('ResultsList');
        ResultsList.append(ResultShortcut);

        const GetStudentResultsDetailsButton = document.createElement('button');
        GetStudentResultsDetailsButton.classList.add('icon-button');
        GetStudentResultsDetailsButton.setAttribute('data-identifier', TestTakerIdentifier);
        GetStudentResultsDetailsButton.innerHTML = `<i class="fa-solid fa-graduation-cap"></i> Zobacz Wyniki`;

        ResultsList.append(GetStudentResultsDetailsButton);

        $(GetStudentResultsDetailsButton).on('click', function(event) {
            event.preventDefault();
            const Identifier = GetStudentResultsDetailsButton.getAttribute('data-identifier');
            window.location.href = `/StudentsAnswers/Answers?Identifier=${Identifier}`;
        });
    }

    static DisplaySetNumber(Count) {
        if (Count == 1) {
            $('#ExerciseCounter').html(`W tym zestawie znajduje się <span style="color: #002eef;">${Count}</span> pytanie`);
        }
        else if (Count > 1 && Count < 5) {
            $('#ExerciseCounter').html(`W tym zestawie znajdują się <span style="color: #002eef;">${Count}</span> pytania`);
        }
        else {
            $('#ExerciseCounter').html(`W tym zestawie znajduje się <span style="color: #002eef;">${Count}</span> pytań`);
        }
    }

    static ShowErrorModal(modalBody) {
        var ErrorModal = new bootstrap.Modal(document.getElementById('ErrorModal'));
        $('#ErrorModal .modal-body p').text(modalBody);
        ErrorModal.toggle();
    }
}

$('#DatePickerBegin').dateTimePicker({
    locale: 'pl',
    title: "Wybierz datę i godzinę",
    buttonTitle: "Ustaw"
});

$('#DatePickerEnd').dateTimePicker({
    locale: 'pl',
    title: "Wybierz datę i godzinę",
    buttonTitle: "Ustaw"
});

function CheckEmptyListNotificationDisplay() {
    if ($('#ExercisesList').height() == 0) {
        $('.empty-list').css('display', 'flex');
    }
    else {
        $('.empty-list').css('display', 'none');
    }
}

function CheckEmptyListNotificationDisplaySessions() {
    const $SessionsShortcuts = $('#AllSessionsList .session-shortcut');
    let isListEmpty = true;
    $SessionsShortcuts.each(function() {
        if ($(this).css('display') == 'flex') {
            $('#AllSessionsListEmpty').css('display', 'none');
            isListEmpty = false;
            return false;
        }
    });

    if (isListEmpty) {
        $('#AllSessionsListEmpty').css('display', 'flex');
    }
}

async function InitialLoad() {
    try {
        const CurrentSetData = await DataManagement.LoadGivenSet();
        console.log(CurrentSetData);
        CurrentSetData.Exercises.forEach(exercise => {
            let QuestionType = '';
            let subOrder = '';
            switch(exercise.ExerciseType) {
                case 'StandardExercise':
                    QuestionType = 'Zwykłe Otwarte';
                    break;
                case 'ProgrammingExercise':
                    QuestionType = 'Programistyczne';
                    break;
                case 'TrueFalseExercise':
                    QuestionType = 'Prawda / Fałsz';
                    subOrder = exercise.SubOrder;
                    break;
            }

            RenderContent.CreateExerciseShortcut(QuestionType, exercise.Content, exercise.Points, 
                exercise.Hashtags == null ? 'Brak' :  exercise.Hashtags, exercise.MainOrder, subOrder);
        });

        CurrentSetData.Sessions.forEach(session => {
            const SessionTime = session.ExpirationTime.replace('T', ' ').substring(0, 16);
            RenderContent.CreateSessionShortcut(session.SessionName, SessionTime, session.UniqueSessionCode);
        });

        if (CurrentSetData.Sessions.length > 4) {
            for (let i = 0; i < 4; i++) {
                const SessionTime = CurrentSetData.Sessions[i].ExpirationTime.substring(11, 16);
                const SessionDate = CurrentSetData.Sessions[i].ExpirationTime.substring(0, 10);
                RenderContent.CreateRecentSession(SessionDate, SessionTime);
            }
        }
        else {
            CurrentSetData.Sessions.forEach(session => {
                const SessionTime = session.ExpirationTime.substring(11, 16);
                const SessionDate = session.ExpirationTime.substring(0, 10);
                RenderContent.CreateRecentSession(SessionDate, SessionTime);
            });
        }

        $('.title-input-group input').val(CurrentSetData.Title);
        $('.description-input-group textarea').val(CurrentSetData.Description);
        RenderContent.DisplaySetNumber(CurrentSetData.Exercises.length);

        $('#AllSessionsList li').on('click', function() {
            $('#ResultsList').html('');
            const CurrentUniqueSessionCode = $(this).next().data('identifier');
            const CurrentSession = CurrentSetData.Sessions
                .find(Session => Session.UniqueSessionCode == CurrentUniqueSessionCode);

            CurrentSession.TestTakers.forEach(TestTaker => {
                if (TestTaker.TakerAnswerSubmissionDate != null) {
                    const AnswerSubmissionTime = TestTaker.TakerAnswerSubmissionDate
                        .replace('T', ' ').substring(0, 16);

                    RenderContent.CreateStudentResultShortcut(TestTaker.TakerFirstName, 
                        TestTaker.TakerLastName, AnswerSubmissionTime, TestTaker.TakerIdentifier);
                }
                else {
                    RenderContent.CreateStudentResultShortcut(TestTaker.TakerFirstName, 
                        TestTaker.TakerLastName, 'Nie ukończył', TestTaker.TakerIdentifier);
                }
            });

            $('#SessionsAndResults').css('display', 'none');
            $('#Results').css('display', 'flex');
        });

        MathJax.typeset();
        CheckEmptyListNotificationDisplaySessions();

        DataManagement.ConfigProtocol = await DataManagement.LoadSessionLinkData();
    }
    catch {
        // error
    }
}

InitialLoad();

jQuery(function() {
    const $UpperNavbar = $('.navbar');
    const $BottomNavbar = $('#SubNavBar');
    const $SearchBarInput = $('.complex-input-shared input');
    const $EditSetDataButtons = $('.edit-set-icon');
    const $TitleInput = $('.title-input-group input');
    const $DescriptionInput = $('.description-input-group textarea');
    const $StartEdittingButton = $('#SubNavBar button');
    const $UpdateSessionButton = $('#TestSessionCreator button');
    const $RightPanel = $('#RightPanel');
    const $RecentSessions = $('#SessionsShortcuts');
    const $Sessions = $('#SessionsAndResults');
    const $Results = $('#Results');
    const $SearchBarSessionInput = $('#SessionSearchBar');
    const $TestTakersSearchBarInput = $('#ResultsSearchBar');
    const $BackToSessionsButton = $('#BackToSessionsButton');

    const UpperNavbarHeight = $UpperNavbar.outerHeight();
    $BottomNavbar.css('top', `${UpperNavbarHeight}px`);
    $RightPanel.css('top', `${UpperNavbarHeight}px`);
    $RightPanel.css('height', `${window.innerHeight - UpperNavbarHeight}px`);
    $RecentSessions.css('height', `${window.innerHeight - UpperNavbarHeight}px`);
    $Sessions.css('height', `${window.innerHeight - UpperNavbarHeight}px`);
    $Results.css('height', `${window.innerHeight - UpperNavbarHeight}px`);

    $('#Logo').attr('src', '/images/logo-quest.png');
    $UpperNavbar.attr('style', 'background-color: #001c8f !important;');
    $('.navbar-link').each(function() {
        $(this).removeClass('navbar-link');
        $(this).addClass('navbar-link-alt');
    });

    $SearchBarInput.on('keyup', function(event) {
        const $ShortcutTitles = $('.question-hashtags');
        $ShortcutTitles.each(function() {
            if ($(this).text().toLowerCase().includes(event.target.value.toLowerCase())) {
                $(this).parent().parent().css('display', 'flex');
            }
            else {
                $(this).parent().parent().css('display', 'none');
            }
            CheckEmptyListNotificationDisplay();
        });
    });

    $SearchBarSessionInput.on('keyup', function(event) {
        const $SessionShortcuts = $('#AllSessionsList li');
        $SessionShortcuts.each(function() {
            if ($(this).find('h6').text().toLowerCase().includes(event.target.value.toLowerCase())) {
                $(this).css('display', 'flex');
                $(this).next().css('display', 'initial');
            }
            else {
                $(this).css('display', 'none');
                $(this).next().css('display', 'none');
            }
        });
        CheckEmptyListNotificationDisplaySessions();
    });

    $TestTakersSearchBarInput.on('keyup', function(event) {
        const $SessionShortcuts = $('#ResultsList li');
        $SessionShortcuts.each(function() {
            if ($(this).find('h6').text().toLowerCase().includes(event.target.value.toLowerCase())) {
                $(this).css('display', 'flex');
                $(this).next().css('display', 'initial');
            }
            else {
                $(this).css('display', 'none');
                $(this).next().css('display', 'none');
            }
        });
    });

    $EditSetDataButtons.each(function() {
        $(this).on('click', function() {
            const isReadonly = $(this).parent().prev().prop('readonly'); 
            $(this).parent().prev().prop('readonly', !isReadonly); 
            $(this).parent().parent().toggleClass('input-gropup-active');
        });
    });

    $TitleInput.on('change', function(event) {
        $(this).prop('readonly', true);
        $(this).parent().removeClass('input-gropup-active');
        DataManagement.UpdateTitle(localStorage.getItem('CurrentSetToOpen'), event.currentTarget.value);
    });

    $DescriptionInput.on('change', function(event) {
        $(this).prop('readonly', true);
        $(this).parent().removeClass('input-gropup-active');
        DataManagement.UpdateDescription(localStorage.getItem('CurrentSetToOpen'), event.currentTarget.value);
    });

    $StartEdittingButton.on('click', function(event) {
        event.preventDefault();
        window.location.href = '/EditSet/Edit';
    });

    $UpdateSessionButton.on('click', function(event) {
        event.preventDefault();
        let SessionStartDate, SessionEndDate;

        $('.date-picker-new-session').each(function() {
            const DateYearMonthDay = $(this).children('span').first().text();
            const Time = $(this).children('span').last().text();

            const Year = parseInt(DateYearMonthDay.substring(0, 4));
            const Month = parseInt(DateYearMonthDay.substring(5, 7)) - 1;
            const Day = parseInt(DateYearMonthDay.substring(8));

            const Hour = parseInt(Time.substring(0, 2));    
            const Minutes = parseInt(Time.substring(3));  

            if ($(this).hasClass('date-picker-start')) {
                SessionStartDate = new Date(Year, Month, Day, Hour, Minutes);
            }
            else {
                SessionEndDate = new Date(Year, Month, Day, Hour, Minutes);
            }
        });
        const SessionName = $('#SessionName').val().trim();

        DataManagement.UpdateCurrentSession(localStorage.getItem('CurrentSetToOpen'), SessionStartDate, SessionEndDate, SessionName);
    });

    $BackToSessionsButton.on('click', function(event) {
        event.preventDefault();
        $('#SessionsAndResults').css('display', 'flex');
        $('#Results').css('display', 'none');
    });
});
    