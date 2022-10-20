class DataManagement {
    static TotalPoints = {};
    static ExerciseNumbersWithFileDownload = [];

    static LoadSessionDetails() {
        const QueryString = window.location.search;
        const URLParams = new URLSearchParams(QueryString);
        const Identifier = URLParams.get('id');

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/Sessions/SessionDetails',
                type: 'POST',
                data: JSON.stringify({Identifier: Identifier}),
                contentType: 'application/json; charset=utf-8',
                success: function(data) {
                    const ParsedData = JSON.parse(data);
                    console.log(ParsedData);
                    resolve(ParsedData);
                },
                error: function(err) {
                    reject(err);
                }
            });
        });
    }

    static LoadStudentsFiles(Takers) {
        const FileNames = [];
        DataManagement.ExerciseNumbersWithFileDownload = DataManagement.ExerciseNumbersWithFileDownload
            .filter((value, index, array) => array.indexOf(value) === index);
        
        Takers.forEach(Taker => {
            DataManagement.ExerciseNumbersWithFileDownload.forEach(Number => {
                const CurrentFileName = `${Taker.ID}-${Number}`;
                FileNames.push(CurrentFileName);
            });
        });

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/StudentsAnswers/PostFileNames',
                type: 'POST',
                data: JSON.stringify(FileNames),
                contentType: 'application/json; charset=utf-8',
                success: function(response) {
                    if (response == 'Success') {
                        var request = new XMLHttpRequest();
                        request.open("GET", "/StudentsAnswers/GetUserFiles");
                        request.setRequestHeader("content-type", "application/octet-stream");
                        request.onload = function() {
                            let FileCounter = 0;
                            const FileData = JSON.parse(this.response);
                            Takers.forEach(Taker => {
                                const $CurrentQuestionsList = $('main').find(`[data-identifier='${Taker.ID}']`);

                                for (let i = 0; i < DataManagement.ExerciseNumbersWithFileDownload.length; i++) {
                                    const CurrentFile = FileData[FileCounter];
                                    var ByteArray = Base64ToArrayBuffer(CurrentFile.fileContents);
                                    const CurrentBlob = new Blob([ByteArray], { type: CurrentFile.contentType });
                                    const URL = window.URL.createObjectURL(CurrentBlob);
    
                                    const $FileViewData = $CurrentQuestionsList.find('.dynamic-div').eq(i);
                                    $FileViewData.children().last()
                                        .html(`Rodzaj pliku: <span>${CurrentFile.contentType}</span>`);
                                    const StudentName = $CurrentQuestionsList.find('.sub-navbar h2')
                                        .first().text().substring(7);
                                    const ExerciseName = $CurrentQuestionsList.find('.file-section-download')
                                        .eq(i).siblings('.question-header').text();
                                    $FileViewData.children().first()
                                        .html(`Nazwa: <span>${StudentName} - ${ExerciseName}</span>`);

                                    const $DownloadLink = $CurrentQuestionsList.find('.download-file-button').eq(i);
                                    $DownloadLink[0].href = URL;
                                    $DownloadLink[0].download = `${StudentName} - ${ExerciseName}` || 
                                        "download-" + Date.now();

                                    FileCounter = FileCounter + 1;
                                }
                            });
                        }
                        request.send();
                    }
                },
                error: function(err) {
                    reject(err);
                }
            });
        });
    }

    static UpdateCurrentSession(BeginDate, ExpirationDate, SessionName) {
        const QueryString = window.location.search;
        const URLParams = new URLSearchParams(QueryString);
        const Identifier = URLParams.get('id');

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/Sessions/UpdateSession',
                type: 'POST',
                data: JSON.stringify({
                    Identifier: Identifier, 
                    NewSessionName: SessionName, 
                    NewSessionStartDate: BeginDate,
                    NewSessionEndDate: ExpirationDate
                }),
                contentType: 'application/json; charset=utf-8',
                success: function(response) {
                    if (response.toString() == 'WrongDate') {
                        RenderContent.ShowErrorModal(`Wskazana data wygaśnięcia nie może być wcześniejsza niż obecna! Wybierz nową i spróbuj ponownie.`);
                    }
                    else if (response.toString() == 'WrongDateRelation') {
                        RenderContent.ShowErrorModal(`Wskazana data wygaśnięcia nie może być wcześniejsza niż data rozpoczęcia! Zmień daty i spróbuj ponownie.`);
                    }
                    else if (response.toString() == 'EmptyName') {
                        RenderContent.ShowErrorModal(`Nazwa sesji nie może być pusta! Nadaj jej wybrany tytuł i spróbuj ponownie.`);
                    }
                    else {
                        RenderContent.ShowSuccessModal(`Udało Ci się pozytywnie zmienić dane sesji!`);
                    }
                },
                error: function(err) {
                    reject(err);
                }
            });
        });
    }

    static SubmitCheckedAnswers(MarkedExercises, ID, GradingStatus) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/Sessions/UpdateTeacherMarking',
                type: 'POST',
                data: JSON.stringify({
                    Identifier: ID, 
                    MarkedExercises: MarkedExercises, 
                    GradingStatus: GradingStatus
                }),
                contentType: 'application/json; charset=utf-8',
                success: function(response) {
                    console.log(response);
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
    static SessionDetails = null;
    static SessionTakers = null;

    static PopulateLeftPanelWithData() {
        const $StudentsCounter = $('.left-panel-box h5');
        const $StudentsCounterComment = $('.left-panel-box h6');
        const $SessionTitle = $('.left-panel-input-group input');
        const $SessionStartTime = $('#DatePickerStart');
        const $SessionEndTime = $('#DatePickerEnd');

        $SessionTitle.val(this.SessionDetails.SessionName);
        $StudentsCounter.text(this.SessionTakers.length);

        if (this.SessionTakers.length == 1) {
            $StudentsCounterComment.text('Wysłana Praca');
        }
        else if (this.SessionTakers.length > 1 && this.SessionTakers.length < 5) {
            $StudentsCounterComment.text('Wysłane Prace');
        }

        $SessionStartTime.dateTimePicker({
            locale: 'pl',
            title: "Wybierz datę i godzinę",
            buttonTitle: "Ustaw",
            showTime: true
        });

        $SessionStartTime.children('span').first().text(this.SessionDetails.StartTime.substring(0, 10));
        $SessionStartTime.children('span').last().text(this.SessionDetails.StartTime.substring(11, 16));

        $SessionEndTime.dateTimePicker({
            locale: 'pl',
            title: "Wybierz datę i godzinę",
            buttonTitle: "Ustaw",
            showTime: true
        });

        $SessionEndTime.children('span').first().text(this.SessionDetails.ExpirationTime.substring(0, 10));
        $SessionEndTime.children('span').last().text(this.SessionDetails.ExpirationTime.substring(11, 16));
    }   

    static RenderStudentsShortcuts() {
        this.SessionTakers.forEach(Taker => {
            if (Taker.Answers.length > 0) {
                const SubmissionDateString = toISOLocalString(Taker.SubmissionDate).substring(11, 16) + ' ' +
                    toISOLocalString(Taker.SubmissionDate).substring(0, 10);

                const StudentShortcut = document.createElement('div');
                StudentShortcut.classList.add('session-taker-shortcut');
                StudentShortcut.innerHTML = `<div class="session-taker-details">
                    <span class="extra-info">Oddano ${SubmissionDateString}</span>
                    <span class="credentials">${Taker.Credentials}</span>
                </div>`;

                const MarkingInfo =  document.createElement('div');

                switch (Taker.MarkingStatus) {
                    case 0:                        
                        MarkingInfo.classList.add('session-taker-marking-info');
                        MarkingInfo.classList.add('marking-info-not-graded');
                        MarkingInfo.innerHTML = `<span class="marking-state">Nie Oceniono!</span>
                        <span class="marking-how-many-marked">Zacznij sprawdzać prace</span>
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: 0%;" 
                                aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                            </div>
                        </div>
                        <i class="fa-solid fa-circle"></i>`;

                        StudentShortcut.append(MarkingInfo);
                        break;

                    case 1:                        
                        MarkingInfo.classList.add('session-taker-marking-info');
                        MarkingInfo.classList.add('marking-info-partially-graded');
                        MarkingInfo.innerHTML = `<span class="marking-state">Częściowo Oceniono!</span>
                        <span class="marking-how-many-marked">Kontynuuj sprawdzanie pracy</span>
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: 70%;" 
                                aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                            </div>
                        </div>
                        <i class="fa-solid fa-circle-half-stroke"></i>`;

                        StudentShortcut.append(MarkingInfo);
                        break;

                    case 2:
                        MarkingInfo.classList.add('session-taker-marking-info');
                        MarkingInfo.classList.add('marking-info-graded');
                        MarkingInfo.innerHTML = `<span class="marking-state">Oceniono!</span>
                        <span class="marking-how-many-marked">Zadania zostały ocenione</span>
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: 100%;" 
                                aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                            </div>
                        </div>
                        <i class="fa-solid fa-circle-check"></i>`;

                        StudentShortcut.append(MarkingInfo);
                        break;
                }

                const ShortcutPopUp = document.createElement('div');
                ShortcutPopUp.classList.add('session-taker-shortcut-popup');
                ShortcutPopUp.innerHTML = `<span>Przejdź do oceniania</span>
                    <i class="fa-solid fa-user-graduate"></i>`;
                
                StudentShortcut.append(ShortcutPopUp);

                const StudentsWithAnswers = document.getElementById('UsersWithAnswers');
                StudentsWithAnswers.append(StudentShortcut);

                $(StudentShortcut).on('click', function() {
                    $('main').find(`[data-identifier='${Taker.ID}']`).css('display', 'block');
                    $('#NavBar').css('display', 'none');
                });
            }
            else {
                const StudentShortcut = document.createElement('div');
                StudentShortcut.classList.add('session-taker-shortcut');
                StudentShortcut.innerHTML = `<div class="session-taker-details">
                    <span class="extra-info">Nie oddano pracy</span>
                    <span class="credentials">${Taker.Credentials}</span>
                </div>`;

                const NoAnswersInfo = document.createElement('div');
                NoAnswersInfo.classList.add('session-taker-no-answers-info');
                NoAnswersInfo.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i>
                <span class="message">Nie wysłano odpowiedzi!</span>`;

                StudentShortcut.append(NoAnswersInfo);

                const StudentsWithoutAnswers = document.getElementById('UsersWithoutAnswers');
                StudentsWithoutAnswers.append(StudentShortcut);
            }
        });
    }

    static RenderAnswersContainers() {
        this.SessionTakers.filter((Taker) => Taker.Answers.length > 0).forEach(Taker => {
            const AnswersContainer = document.createElement('div');
            AnswersContainer.classList.add('answers-container');
            $(AnswersContainer).attr('data-identifier', Taker.ID);
            AnswersContainer.innerHTML = `<div class="sub-navbar">
                <h2></h2>
                <h2></h2>
                <h2 id="test-score"></h2>
            </div>
            <div class="questions-with-answers-list">

            </div>`;

            const Main = document.getElementsByTagName('main');
            Main[0].append(AnswersContainer);
        });
    }

    static RenderStudentsAnswers() {
        this.SessionTakers.forEach(Taker => {
            let TrueFalseExercises = [];
            for (let i = 0; i < Taker.Answers.length; i++) {
                if (Taker.Answers[i].ExerciseType == 'TrueFalseExercise') {
                    if (Taker.Answers[i + 1] == undefined || 
                        Taker.Answers[i + 1].ExerciseType != 'TrueFalseExercise') 
                    {
                        TrueFalseExercises.push(Taker.Answers[i]);
                        RenderContent.RenderTrueFalseQuestionWithAnswer(TrueFalseExercises, Taker.ID);
                        TrueFalseExercises = [];
                    }
                    else {
                        TrueFalseExercises.push(Taker.Answers[i]);
                        continue;
                    }
                }
                else {
                    RenderContent.RenderStandardQuestionWithAnswer(Taker.Answers[i], Taker.ID);
                }
            }
        });
    }

    static RenderStandardQuestionWithAnswer(Exercise, ID) {
        let CorrectAnswerPercentage = '';
        if (Exercise.GainedPoints == -1) {
            Exercise.GainedPoints = '';
            CorrectAnswerPercentage = '0%';
        }
        else {
            CorrectAnswerPercentage = (Math.round((Exercise.GainedPoints / Exercise.Points) * 100)).toString() + '%';
        }

        if (Exercise.TeacherComment == null) {
            Exercise.TeacherComment = '';
        }

        const Question = document.createElement('div');
        Question.classList.add('container');
        Question.classList.add('container-exercise');
        Question.classList.add('standard');
        Question.setAttribute('id', `Exercise-${Exercise.MainOrder}`);
        Question.innerHTML = `<div class="row justify-content-center">
            <div class="col-sm-12 col-lg-9 question-column">
                <h1 class="question-header">Zadanie ${Exercise.MainOrder}</h1>
                <div class="question-content">
                    ${Exercise.ExerciseContent}
                </div>
                <h3 class="user-answer">
                    <span class="user-answer-header">Odpowiedź ucznia:</span>
                    <span class="answer-content"></span>
                </h3>
                <div class="answer-points">
                    <h4>Liczba <span>punktów</span> za rozwiązanie: </h4>
                    <input value="${Exercise.GainedPoints}" type="text" class="asnwer-points-input" placeholder="Oceń!" />
                    <h4 style="color: #33FF00">/ ${Exercise.Points}</h4>
                </div>
                <div class="progress exercise-progress">
                    <div class="progress-bar bg-success" role="progressbar" style="width: ${CorrectAnswerPercentage}">${CorrectAnswerPercentage}</div>
                </div>
                <textarea class="comment" rows="3" 
                    placeholder="Dodaj komentarz do zadania i odpowiedzi...">${Exercise.TeacherComment}</textarea>
            </div>
        </div>`;

        const QuestionsWithAnswersList = $('main').find(`[data-identifier='${ID}']`)
            .children('.questions-with-answers-list')[0];
        QuestionsWithAnswersList.append(Question);

        if (Exercise.AnswerContent == '') {
            $(Question).find('.answer-content')[0].innerText = 'Brak';
        }
        else {
            $(Question).find('.answer-content')[0].innerText = `${Exercise.AnswerContent}`;
        }

        $(Question).find('.asnwer-points-input').on('change', function(event) {
            const AssignedPoints = parseInt(event.target.value); 
            if (!isNaN(AssignedPoints) && AssignedPoints >= 0 && AssignedPoints <= Exercise.Points) {
                const stringValue = (Math.round((AssignedPoints / Exercise.Points) * 100)).toString() + '%';
                $(Question).find('.progress-bar').css('width', stringValue);
                $(Question).find('.progress-bar').text(stringValue);
                UpdateUpperScoreCounter($(Question).closest('.answers-container'), ID);
            }
            else if (event.target.value.trim() == '') {
                $(Question).find('.progress-bar').css('width', '0%');
                $(Question).find('.progress-bar').text('0%');
                UpdateUpperScoreCounter($(Question).closest('.answers-container'), ID);
            }
            else {
                $(Question).find('.progress-bar').css('width', '0px');
                $(Question).find('.progress-bar').text('0%');
                ShowErrorModal(`Punktacja każdego pytania musi być uzupełniona poprawną liczbą całkowitą tzn. większą od zera i mniejszą lub równą niż maksymalna liczba punktów za zadanie.`);
            }
        });

        if (Exercise.ExerciseType == 'ProgrammingExercise' && Exercise.CodeAnswerContent != null) {
            const CodeAnswer = document.createElement('textarea');
            CodeAnswer.setAttribute('id', `Code-${ID}-${Exercise.MainOrder}`);
            CodeAnswer.setAttribute('style', `display: none;`);
            $(CodeAnswer).insertBefore($(Question).find('.answer-points'));

            $(Question).find('.user-answer-header').text('Dodatkowe uwagi:');

            if (Exercise.CodeAnswerLanguage == 'Python') {
                var Editor = CodeMirror.fromTextArea(document.getElementById(`Code-${ID}-${Exercise.MainOrder}`), {
                    mode: 'python',
                    theme: 'yonce',
                    viewportMargin: '10',
                    lineNumbers: true,
                    autoRefresh: true
                }).setValue(Exercise.CodeAnswerContent);
            }
            else if (Exercise.CodeAnswerLanguage == 'Java') {
                var Editor = CodeMirror.fromTextArea(document.getElementById(`Code-${ID}-${Exercise.MainOrder}`), {
                    mode: 'text/x-java',
                    theme: 'yonce',
                    viewportMargin: '10',
                    lineNumbers: true,
                    autoRefresh: true
                }).setValue(Exercise.CodeAnswerContent);
            }
            else if (Exercise.CodeAnswerLanguage == 'C++') {
                var Editor = CodeMirror.fromTextArea(document.getElementById(`Code-${ID}-${Exercise.MainOrder}`), {
                    mode: 'text/x-c++src',
                    theme: 'yonce',
                    viewportMargin: '10',
                    lineNumbers: true,
                    autoRefresh: true
                }).setValue(Exercise.CodeAnswerContent);
            }
            else {
                var Editor = CodeMirror.fromTextArea(document.getElementById(`Code-${ID}-${Exercise.MainOrder}`), {
                    mode: 'text/x-c++src',
                    theme: 'yonce',
                    viewportMargin: '10',
                    lineNumbers: true,
                    autoRefresh: true
                }).setValue(Exercise.CodeAnswerContent);
            }

            const EditorObject = $(Question).find(".CodeMirror")[0];
            EditorObject.setAttribute("style", "height: auto; min-height: 100px; max-height: 700px; width: 100%");

            if ($(EditorObject).outerHeight() == 700) {
                $(EditorObject).find('.CodeMirror-vscrollbar').css('display', 'block');
            }
            else {
                $(EditorObject).find('.CodeMirror-vscrollbar').css('display', 'none');
                $(EditorObject).css('border-top-right-radius', '7px');
                $(EditorObject).css('border-bottom-right-radius', '7px');
            }

            const CodeButtons = document.createElement('div');
            CodeButtons.classList.add('code-buttons');
            CodeButtons.innerHTML = `<button data-mode="small">
                Powiększ / Pomniejsz <i class="fa-solid fa-expand"></i>
            </button>
            <button>
                Kopiuj <i class="fa-regular fa-clipboard"></i>
            </button>`;

            EditorObject.append(CodeButtons);

            $(CodeButtons).children().first().on('click', function(event) {
                event.preventDefault();
                if ($(this).data('mode') == 'small') {
                    const maxWidth = window.innerWidth * 0.9;
                    EditorObject.setAttribute("style", "height: auto; min-height: 100px; max-height: 700px;" +
                        `width: auto; max-width: ${maxWidth}px`);
                    $(this).data('mode', 'big');
                }
                else {
                    EditorObject.setAttribute("style", "height: auto; min-height: 100px; max-height: 700px;" + 
                        "width: 100%");
                    $(this).data('mode', 'small');
                }
            });

            $(CodeButtons).children().last().on('click', function(event) {
                event.preventDefault();
                (async () => {
                    await navigator.clipboard.writeText(Exercise.CodeAnswerContent);
                })();
            });
        }
        else {
            switch (Exercise.AdditionalData) {
                case '1':
                    DataManagement.ExerciseNumbersWithFileDownload.push(Exercise.MainOrder);

                    const FileSection = document.createElement('div');
                    FileSection.classList.add('file-section-download');
                    FileSection.innerHTML = `<div class="fixed-div" style="width: auto; display: flex; justify-content: center">
                        <img src="/images/file.png" width="65" height="65" />
                    </div>
                    <div class="dynamic-div" style="width: auto;">
                        <h2 class="file-description">Nazwa: -</h2>
                        <h2 class="file-description">Rodzaj: -</h2>
                    </div>
                    <div class="fixed-div" style="width: auto; display: flex; justify-content: center">
                        <a class="download-file-button">
                            Pobierz Plik <i class="fa-solid fa-download"></i>
                        </a>
                    </div>`;
                    $(FileSection).insertBefore($(Question).find('.answer-points'));

                    break;
            }
        }
    }

    static RenderTrueFalseQuestionWithAnswer(Exercises, ID) {
        const Question = document.createElement('div');
        Question.classList.add('container');
        Question.classList.add('container-exercise');
        Question.classList.add('true-false');
        Question.setAttribute('id', `Exercise-${Exercises[0].MainOrder}`);
        Question.innerHTML = `<div class="row justify-content-center">
            <div class="col-sm-12 col-lg-9 question-column">
                <h1 class="question-header">Zadanie ${Exercises[0].MainOrder}</h1>
                <div class="question-sub-header">
                    <span class="long-span">Treść</span>
                    <span class="short-span">Prawda</span>
                    <span class="short-span">Fałsz</span>
                </div>
                <div class="question-content" style="margin-bottom: 0px">
                </div>
            </div>
        </div>`;

        const QuestionsWithAnswersList = $('main').find(`[data-identifier='${ID}']`)
            .children('.questions-with-answers-list')[0];
        QuestionsWithAnswersList.append(Question);

        let TotalPoints = 0;
        let TotalCorrectPoints = 0;
        Exercises.forEach(Exercise => {
            if (Exercise.AnswerContent == 'true' && Exercise.CorrectAnswer == '1' ||
            Exercise.AnswerContent == 'false' && Exercise.CorrectAnswer == '0') 
            {
                TotalCorrectPoints = TotalCorrectPoints + Exercise.Points;
            }

            const SubQuestion = document.createElement('div');
            SubQuestion.classList.add('true-false-sub-question');
            if (Exercise.AnswerContent == 'true') {
                SubQuestion.innerHTML = `<div class="true-false-sub-question-content">
                    ${Exercise.ExerciseContent}
                </div>
                <div class="form-check form-check-inline true-false-check">
                    <input class="form-check-input" name="TrueFalseRadion-${Exercise.MainOrder}-${Exercise.SubOrder}-${ID}" 
                        type="radio" value="true" checked />
                </div>
                <div class="form-check form-check-inline true-false-check">
                    <input class="form-check-input" name="TrueFalseRadion-${Exercise.MainOrder}-${Exercise.SubOrder}-${ID}" 
                        type="radio" value="false" disabled />
                </div>`;
            }
            else {
                SubQuestion.innerHTML = `<div class="true-false-sub-question-content">
                    ${Exercise.ExerciseContent}
                </div>
                <div class="form-check form-check-inline true-false-check">
                    <input class="form-check-input" name="TrueFalseRadion-${Exercise.MainOrder}-${Exercise.SubOrder}-${ID}" 
                        type="radio" value="true" disabled />
                </div>
                <div class="form-check form-check-inline true-false-check">
                    <input class="form-check-input" name="TrueFalseRadion-${Exercise.MainOrder}-${Exercise.SubOrder}-${ID}" 
                        type="radio" value="false" checked />
                </div>`;
            }

            TotalPoints = TotalPoints + Exercise.Points;
            $(Question).find('.question-content')[0].append(SubQuestion);
        });

        const Points = document.createElement('div');
        Points.classList.add('answer-points');
        Points.innerHTML = `<h4>Liczba <span>punktów</span> za rozwiązanie: </h4>
        <input type="text" value="${TotalCorrectPoints}" class="asnwer-points-input" readonly />
        <h4 style="color: #33FF00">/ ${TotalPoints}</h4>`;

        const ProgressBar = document.createElement('div');
        ProgressBar.classList.add('progress');
        ProgressBar.classList.add('exercise-progress');
        const stringValue = (Math.round((TotalCorrectPoints / TotalPoints) * 100)).toString() + '%';
        ProgressBar.innerHTML = `<div class="progress-bar bg-success" role="progressbar" 
            style="width: ${stringValue}">${stringValue}</div>`;

        $(Question).find('.question-column')[0].append(Points);
        $(Question).find('.question-column')[0].append(ProgressBar);
    } 

    static RenderInfoNavBars() {
        this.SessionTakers.filter((Taker) => Taker.Answers.length > 0).forEach(Taker => {
            const $TakerAnswersContainer = $('main').find(`[data-identifier='${Taker.ID}']`);

            const FullName = Taker.Credentials;
            $TakerAnswersContainer.find('.sub-navbar h2').first().html(`Uczeń: <span>${FullName}</span>`);
            $TakerAnswersContainer.find('.sub-navbar h2').first().next().html(`Data Przesłania: 
                <span>${toISOLocalString(Taker.SubmissionDate).replace('T', ' ').substring(0, 19)}</span>`);

            let TotalGainedPointsByStudent = 0;
            let TotalPoints = 0;
            for (let i = 0; i < Taker.Answers.length; i++) {
                if (i != Taker.Answers.length - 1) {
                    if (Taker.Answers[i + 1].ExerciseType == "TrueFalseExercise" &&
                        Taker.Answers[i].ExerciseType == "TrueFalseExercise")
                    {
                        TotalPoints = TotalPoints + Taker.Answers[i].Points;
                        continue;
                    }
                }

                TotalGainedPointsByStudent = TotalGainedPointsByStudent + Taker.Answers[i].GainedPoints;
                TotalPoints = TotalPoints + Taker.Answers[i].Points;
            };

            DataManagement.TotalPoints[Taker.ID] = TotalPoints;
            UpdateUpperScoreCounter($TakerAnswersContainer, Taker.ID);

            const $UpperNavbar = $('.navbar');
            const $BottomNavbar = $TakerAnswersContainer.find('.sub-navbar');
            const UpperNavbarHeight = $UpperNavbar.outerHeight();
            $BottomNavbar.css('top', `${UpperNavbarHeight}px`);
        });
    }

    static RenderTopNavbarContainerForMarking() {
        this.SessionTakers.filter((Taker) => Taker.Answers.length > 0).forEach(Taker => {
            const $TakerAnswersContainer = $('main').find(`[data-identifier='${Taker.ID}']`);

            const SubmitButtonTopContainer = document.createElement('div');
            SubmitButtonTopContainer.classList.add('user-answers-navbar');
            SubmitButtonTopContainer.innerHTML = `<button class="top-switch-student-button left-swipe-button">
                <i class="fa-solid fa-angle-left"></i> Poprzedni Uczeń
            </button>
            <button class="top-middle-button exit-answers-button" style="margin-left: auto">
                Wróć do listy <i class="fa-solid fa-arrow-rotate-left"></i>
            </button>
            <button class="top-middle-button save-answers-button" style="margin-right: auto">
                Zapisz Zmiany <i class="fa-solid fa-cloud-arrow-up"></i>
            </button>
            <button class="top-switch-student-button right-swipe-button">
                Następny Uczeń <i class="fa-solid fa-angle-right"></i>
            </button>`;

            $TakerAnswersContainer[0].insertBefore(SubmitButtonTopContainer, 
                $TakerAnswersContainer.find('.sub-navbar')[0]);
            
            const $UpperNavbar = $('.navbar');
            const UpperNavbarHeight = $UpperNavbar.outerHeight();
            $(SubmitButtonTopContainer).css('height', `${UpperNavbarHeight}px`);

            $TakerAnswersContainer.find('.exit-answers-button').on('click', function(event) {
                event.preventDefault();
                window.location.href = window.location.href.substring(0, window.location.href.indexOf('&'));
            });

            $TakerAnswersContainer.find('.left-swipe-button').on('click', function(event) {
                event.preventDefault();

                let isSecondValidationPassed = true;
                let MarkedExercises = [];
        
                $TakerAnswersContainer.find('.container-exercise').each(function() {
                    let PointsValue = null;
                    if ($(this).find('.asnwer-points-input').val().trim() == '') {
                        PointsValue = -1;
                    }
                    else {
                        PointsValue = parseInt($(this).find('.asnwer-points-input').val().trim());
                    }
                    const MaxPointsValue = parseInt($(this).find('.asnwer-points-input').next().text().substring(2));
        
                    if (isNaN(PointsValue) || PointsValue < -1 || PointsValue > MaxPointsValue) {
                        RenderContent.ShowErrorModal(`Punkty nie zostały wszędzie uzupełnione! Punktacja każdego pytania musi być pusta (wtedy pytanie jest oznacznone jako nieocenione) lub uzupełniona poprawną liczbą całkowitą tzn. większą od zera i mniejszą lub równą niż maksymalna liczba punktów za zadanie. Uzupełnij brakujące punkty i spróbuj ponownie.`);
        
                        isSecondValidationPassed = false;
                        return false;
                    }
        
                    const MarkedExercise = {
                        ExerciseOrder: parseInt($(this).find('.question-header').text().substring(8)),
                        AnswerPoints: PointsValue,
                        TeacherComment: $(this).find('.comment').val() == undefined ? null : $(this).find('.comment').val().trim()
                    }
                    MarkedExercises.push(MarkedExercise);
                });
        
                if (!isSecondValidationPassed) {
                    return;
                }

                if (MarkedExercises.every((Exercise) => Exercise.AnswerPoints == -1)) {
                    DataManagement.SubmitCheckedAnswers(MarkedExercises, Taker.ID, 0);
                }
                else if (MarkedExercises.every((Exercise) => Exercise.AnswerPoints != -1)) {
                    DataManagement.SubmitCheckedAnswers(MarkedExercises, Taker.ID, 2);
                }
                else {
                    DataManagement.SubmitCheckedAnswers(MarkedExercises, Taker.ID, 1);
                }

                $TakerAnswersContainer.css('display', 'none');
                if ($TakerAnswersContainer.prev().hasClass('answers-container')) {
                    $TakerAnswersContainer.prev().css('display', 'block');
                }
                else {
                    $('main').find(`.answers-container`).last().css('display', 'block');
                }
            });

            $TakerAnswersContainer.find('.right-swipe-button').on('click', function(event) {
                event.preventDefault();

                let isSecondValidationPassed = true;
                let MarkedExercises = [];
        
                $TakerAnswersContainer.find('.container-exercise').each(function() {
                    let PointsValue = null;
                    if ($(this).find('.asnwer-points-input').val().trim() == '') {
                        PointsValue = -1;
                    }
                    else {
                        PointsValue = parseInt($(this).find('.asnwer-points-input').val().trim());
                    }
                    const MaxPointsValue = parseInt($(this).find('.asnwer-points-input').next().text().substring(2));
        
                    if (isNaN(PointsValue) || PointsValue < -1 || PointsValue > MaxPointsValue) {
                        RenderContent.ShowErrorModal(`Punkty nie zostały wszędzie uzupełnione! Punktacja każdego pytania musi być pusta (wtedy pytanie jest oznacznone jako nieocenione) lub uzupełniona poprawną liczbą całkowitą tzn. większą od zera i mniejszą lub równą niż maksymalna liczba punktów za zadanie. Uzupełnij brakujące punkty i spróbuj ponownie.`);
        
                        isSecondValidationPassed = false;
                        return false;
                    }
        
                    const MarkedExercise = {
                        ExerciseOrder: parseInt($(this).find('.question-header').text().substring(8)),
                        AnswerPoints: PointsValue,
                        TeacherComment: $(this).find('.comment').val() == undefined ? null : $(this).find('.comment').val().trim()
                    }
                    MarkedExercises.push(MarkedExercise);
                });
        
                if (!isSecondValidationPassed) {
                    return;
                }

                if (MarkedExercises.every((Exercise) => Exercise.AnswerPoints == -1)) {
                    DataManagement.SubmitCheckedAnswers(MarkedExercises, Taker.ID, 0);
                }
                else if (MarkedExercises.every((Exercise) => Exercise.AnswerPoints != -1)) {
                    DataManagement.SubmitCheckedAnswers(MarkedExercises, Taker.ID, 2);
                }
                else {
                    DataManagement.SubmitCheckedAnswers(MarkedExercises, Taker.ID, 1);
                }

                $TakerAnswersContainer.css('display', 'none');
                if ($TakerAnswersContainer.next().hasClass('answers-container')) {
                    $TakerAnswersContainer.next().css('display', 'block');
                }
                else {
                    $('main').find(`.answers-container`).first().css('display', 'block');
                }
            });

            $TakerAnswersContainer.find('.save-answers-button').on('click', function(event) {
                event.preventDefault();
                let isSecondValidationPassed = true;
                let MarkedExercises = [];
        
                $TakerAnswersContainer.find('.container-exercise').each(function() {
                    let PointsValue = null;
                    if ($(this).find('.asnwer-points-input').val().trim() == '') {
                        PointsValue = -1;
                    }
                    else {
                        PointsValue = parseInt($(this).find('.asnwer-points-input').val().trim());
                    }
                    const MaxPointsValue = parseInt($(this).find('.asnwer-points-input').next().text().substring(2));
        
                    if (isNaN(PointsValue) || PointsValue < -1 || PointsValue > MaxPointsValue) {
                        RenderContent.ShowErrorModal(`Punkty nie zostały wszędzie uzupełnione! Punktacja każdego pytania musi być pusta (wtedy pytanie jest oznacznone jako nieocenione) lub uzupełniona poprawną liczbą całkowitą tzn. większą od zera i mniejszą lub równą niż maksymalna liczba punktów za zadanie. Uzupełnij brakujące punkty i spróbuj ponownie.`);
        
                        isSecondValidationPassed = false;
                        return false;
                    }
        
                    const MarkedExercise = {
                        ExerciseOrder: parseInt($(this).find('.question-header').text().substring(8)),
                        AnswerPoints: PointsValue,
                        TeacherComment: $(this).find('.comment').val() == undefined ? null : $(this).find('.comment').val().trim()
                    }
                    MarkedExercises.push(MarkedExercise);
                });
        
                if (!isSecondValidationPassed) {
                    return;
                }

                if (MarkedExercises.every((Exercise) => Exercise.AnswerPoints == -1)) {
                    DataManagement.SubmitCheckedAnswers(MarkedExercises, Taker.ID, 0);
                }
                else if (MarkedExercises.every((Exercise) => Exercise.AnswerPoints != -1)) {
                    DataManagement.SubmitCheckedAnswers(MarkedExercises, Taker.ID, 2);
                }
                else {
                    DataManagement.SubmitCheckedAnswers(MarkedExercises, Taker.ID, 1);
                }
    
                RenderContent.ShowSuccessModal(`Ocena i uwagi zostały zapisane! Teraz możesz przejść do poprawy kolejnej lub opuścić stronę.`);
            });
        });
    }

    static ShowErrorModal(modalBody) {
        var ErrorModal = new bootstrap.Modal(document.getElementById('ErrorModal'));
        $('#ErrorModal .modal-body p').text(modalBody);
        ErrorModal.toggle();
    }

    static ShowSuccessModal(modalBody) {
        var SuccessModal = new bootstrap.Modal(document.getElementById('SuccessModal'));
        $('#SuccessModal .modal-body p').text(modalBody);
        SuccessModal.toggle();
    }
}

class QuickSortAlgorythm {

    static QuickSort(items, left, right, order, propertyName) {
        const pivot = items[Math.floor((left + right) / 2)][propertyName];
        let i = left;
        let j = right;

        if (items.length > 1 && right > left) {
            if (order == 'asc') {
                do {
                    while (items[i][propertyName] < pivot) 
                    {
                        i++;
                    }
                    while (items[j][propertyName] > pivot) 
                    {
                        j--;
                    }
                    if (i <= j) {
                        this.swap(items, i, j);
                        i++;
                        j--;
                    }
                } while (i <= j);
            }
            else {
                do {
                    while (items[i][propertyName] > pivot) 
                    {
                        i++;
                    }
                    while (items[j][propertyName] < pivot) 
                    {
                        j--;
                    }
                    if (i <= j) {
                        this.swap(items, i, j);
                        i++;
                        j--;
                    }
                } while (i <= j);
            }

            if (left < j) {
                this.QuickSort(items, left, j, order, propertyName);
            }

            if (i < right) {
                this.QuickSort(items, i, right, order, propertyName);
            }
        }

        return items;
    }

    static swap(items, i, j) {
        const temp = items[i];
        items[i] = items[j];
        items[j] = temp;
        console.log(items);
    }
}

function UpdateUpperScoreCounter($TestTakerAnswerContainer, TakerID) {
    let TotalGainedPointsByStudent = 0;
    $TestTakerAnswerContainer.find('.asnwer-points-input').each(function() {
        const ExerciseScore = parseInt($(this).val().trim());
        if (!isNaN(ExerciseScore)) {
            TotalGainedPointsByStudent = TotalGainedPointsByStudent + ExerciseScore;
        }
        else if ($(this).val().trim() == '') {
            TotalGainedPointsByStudent = TotalGainedPointsByStudent + 0;
        }
    });

    let resultColor = '';
    const PercentScore = Math.round((TotalGainedPointsByStudent / DataManagement.TotalPoints[TakerID]) * 100);
    if (PercentScore > 85) {
        resultColor = '#009432';
    }
    else if (PercentScore > 70) {
        resultColor = '#33FF00';
    }
    else if (PercentScore > 50) {
        resultColor = '#f9ca24';
    }
    else if (PercentScore > 30) {
        resultColor = '#F79F1F';
    }
    else {
        resultColor = '#EA2027';
    }
    $TestTakerAnswerContainer.find('.sub-navbar h2').last()
        .html(`Wynik: <span style="color: ${resultColor} !important">${TotalGainedPointsByStudent} pkt. na ${DataManagement.TotalPoints[TakerID]} pkt. \u2014 ${PercentScore}%</span>`);
}

function CheckEmptyStudentsWithAnswersList() {
    if ($('#UsersWithAnswers').height() == 0) {
        $('#UsersWithAnswersEmptyList').css('display', 'flex');
    }
    else {
        $('#UsersWithAnswersEmptyList').css('display', 'none');
    }
}

function CheckEmptyStudentsWithoutAnswersList() {
    if ($('#UsersWithoutAnswers').height() == 0) {
        $('#UsersWithoutAnswersEmptyList').css('display', 'flex');
    }
    else {
        $('#UsersWithoutAnswersEmptyList').css('display', 'none');
    }
}

function Base64ToArrayBuffer(base64) {
    var binaryString = window.atob(decodeURIComponent(base64));
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
       var ascii = binaryString.charCodeAt(i);
       bytes[i] = ascii;
    }
    return bytes;
}

function toISOLocalString(GivenDate) {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(GivenDate - tzoffset)).toISOString().slice(0, -1);
}

async function InitialLoad() {
    const SessionData = await DataManagement.LoadSessionDetails();

    SessionData.TestTakers.forEach(Taker => {
        Taker.SubmissionDate = new Date(Taker.SubmissionDate);
    });

    RenderContent.SessionDetails = SessionData.Details;
    RenderContent.SessionTakers = SessionData.TestTakers;

    RenderContent.PopulateLeftPanelWithData();
    RenderContent.RenderStudentsShortcuts();
    RenderContent.RenderAnswersContainers();
    RenderContent.RenderStudentsAnswers();
    RenderContent.RenderInfoNavBars();
    RenderContent.RenderTopNavbarContainerForMarking();

    const tx = document.getElementsByClassName("comment");
    for (let i = 0; i < tx.length; i++) {
        tx[i].setAttribute("style", "height: 75px; overflow-y:hidden;");
        tx[i].addEventListener("input", OnInput, false);
    }

    function OnInput() {
        this.style.height = (this.scrollHeight) + "px";
    }

    DataManagement.LoadStudentsFiles(RenderContent.SessionTakers.filter((Taker) => Taker.Answers.length > 0));
    CheckEmptyStudentsWithAnswersList();
    CheckEmptyStudentsWithoutAnswersList();
    MathJax.typeset();

    const QueryString = window.location.search;
    const URLParams = new URLSearchParams(QueryString);
    const TakerIDToOpen = URLParams.get('takerId');
    if (TakerIDToOpen != null && TakerIDToOpen != undefined && TakerIDToOpen != '') {
        $('main').find(`[data-identifier='${TakerIDToOpen}']`).css('display', 'block');
        $('#NavBar').css('display', 'none');
    }
}

InitialLoad();

jQuery(function() {
    const $UpdateSessionButton = $('#LeftPanel button');
    const $GrouppingSelectors = $('.grouping-selector');
    const $SearchBarInput = $('.complex-input-shared input');
    const $SortingSelect = $('.sorting-select');
    const $UpperNavbar = $('.navbar');
    const $LeftPanel = $('#LeftPanel');

    const UpperNavbarHeight = $UpperNavbar.outerHeight();
    $LeftPanel.css('height', `${window.innerHeight - UpperNavbarHeight}px`);
    $LeftPanel.css('top', `${UpperNavbarHeight}px`);

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

        DataManagement.UpdateCurrentSession(SessionStartDate, SessionEndDate, SessionName);
    });

    $SearchBarInput.on('keyup', function(event) {
        const $ShortcutCredentials = $('.session-taker-details .credentials');
        $ShortcutCredentials.each(function() {
            if ($(this).text().toLowerCase().includes(event.target.value.toLowerCase())) {
                $(this).closest('.session-taker-shortcut').css('display', 'flex');
            }
            else {
                $(this).closest('.session-taker-shortcut').css('display', 'none');
            }
        });
        CheckEmptyStudentsWithAnswersList();
    });

    $SortingSelect.on('change', function(event) {
        const NewOption = event.target.value;
        switch(NewOption) {
            case '0':
                RenderContent.SessionTakers = QuickSortAlgorythm.QuickSort([...RenderContent.SessionTakers], 0, 
                    RenderContent.SessionTakers.length - 1, 'desc', 'SubmissionDate');
                
                $('#UsersWithAnswers').html('');
                RenderContent.RenderStudentsShortcuts();

                CheckEmptyStudentsWithAnswersList();
                break;

            case '1':
                RenderContent.SessionTakers = QuickSortAlgorythm.QuickSort([...RenderContent.SessionTakers], 0, 
                    RenderContent.SessionTakers.length - 1, 'asc', 'SubmissionDate');
                
                $('#UsersWithAnswers').html('');
                RenderContent.RenderStudentsShortcuts();

                CheckEmptyStudentsWithAnswersList();
                break;

            case '2':
                RenderContent.SessionTakers = QuickSortAlgorythm.QuickSort([...RenderContent.SessionTakers], 0, 
                    RenderContent.SessionTakers.length - 1, 'asc', 'Credentials');
                
                $('#UsersWithAnswers').html('');
                RenderContent.RenderStudentsShortcuts();

                CheckEmptyStudentsWithAnswersList();
                break;

            case '3':
                RenderContent.SessionTakers = QuickSortAlgorythm.QuickSort([...RenderContent.SessionTakers], 0, 
                    RenderContent.SessionTakers.length - 1, 'desc', 'Credentials');
                
                $('#UsersWithAnswers').html('');
                RenderContent.RenderStudentsShortcuts();

                CheckEmptyStudentsWithAnswersList();
                break;
        }
    });

    $GrouppingSelectors.each(function() {
        $(this).on('click', function() {
            if (!$(this).hasClass('grouping-selector-active')) {
                $GrouppingSelectors.removeClass('grouping-selector-active');
                $(this).addClass('grouping-selector-active');

                const $Shortcuts = $('.session-taker-shortcut');
                switch($(this).text().trim()) {
                    case 'Wszystkie': 
                        $Shortcuts.each(function() {
                            $(this).css('display', 'flex');
                        });
                        CheckEmptyStudentsWithAnswersList();
                        break;
                    case 'Nowe / Nie ocenione': 
                        $Shortcuts.each(function() {
                            if ($(this).find('.session-taker-marking-info').first().hasClass('marking-info-not-graded')) {
                                $(this).css('display', 'flex');
                            }
                            else {
                                $(this).css('display', 'none');
                            }
                        });
                        CheckEmptyStudentsWithAnswersList();
                        break;
                    case 'Częściowo Ocenione': 
                        $Shortcuts.each(function() {
                            if ($(this).find('.session-taker-marking-info').first().hasClass('marking-info-partially-graded')) {
                                $(this).css('display', 'flex');
                            }
                            else {
                                $(this).css('display', 'none');
                            }
                        });
                        CheckEmptyStudentsWithAnswersList();
                        break;
                    case 'Ocenione': 
                        $Shortcuts.each(function() {
                            if ($(this).find('.session-taker-marking-info').first().hasClass('marking-info-graded')) {
                                $(this).css('display', 'flex');
                            }
                            else {
                                $(this).css('display', 'none');
                            }
                        });
                        CheckEmptyStudentsWithAnswersList();
                        break;
                }
            }
        });
    });
});