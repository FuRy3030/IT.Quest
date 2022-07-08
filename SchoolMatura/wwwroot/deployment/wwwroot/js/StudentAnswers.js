class DataManagement {
    static TotalPoints = 0;
    static ExerciseNumbersWithFileDownload = [];

    static LoadUserAnswers() {
        const QueryString = window.location.search;
        const URLParams = new URLSearchParams(QueryString);
        const Identifier = URLParams.get('Identifier');

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/StudentsAnswers/GetAnswers',
                type: 'POST',
                data: JSON.stringify({Identifier: Identifier}),
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

    static LoadStudentsFiles() {
        const QueryString = window.location.search;
        const URLParams = new URLSearchParams(QueryString);
        const Identifier = URLParams.get('Identifier');
        const FileNames = [];

        DataManagement.ExerciseNumbersWithFileDownload.forEach(Number => {
            const CurrentFileName = `${Identifier}-${Number}`;
            FileNames.push(CurrentFileName);
        });

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/StudentsAnswers/PostFileNames',
                type: 'POST',
                data: JSON.stringify(FileNames),
                contentType: 'application/json; charset=utf-8',
                success: function(response) {
                    if (response == 'Success') {
                        console.log(response);
                        var request = new XMLHttpRequest();
                        request.open("GET", "/StudentsAnswers/GetUserFiles");
                        request.setRequestHeader("content-type", "application/octet-stream");
                        request.onload = function() {
                            console.log(JSON.parse(this.response));
                            console.log(new Blob([JSON.parse(this.response)[0].fileContents], { type: JSON.parse(this.response)[0].contentType }));
                            let Counter = 0;
                            const FileData = JSON.parse(this.response);
                            FileData.forEach(File => {
                                var ByteArray = Base64ToArrayBuffer(File.fileContents);
                                const CurrentBlob = new Blob([ByteArray], { type: File.contentType });
                                const URL = window.URL.createObjectURL(CurrentBlob);

                                const $FileViewData = $('.dynamic-div').eq(Counter);
                                $FileViewData.children().last().html(`Rodzaj pliku: <span>${File.contentType}</span>`);
                                const StudentName = $('#SubNavBar h2').first().text().substring(7);
                                const ExerciseName = $('.file-section-download')
                                    .eq(Counter).siblings('.question-header').text();
                                $FileViewData.children().first().html(`Nazwa: <span>${StudentName} - ${ExerciseName}</span>`);

                                const $DownloadLink = $('.download-file-button').eq(Counter);
                                $DownloadLink[0].href = URL;
                                $DownloadLink[0].download = `${StudentName} - ${ExerciseName}` || "download-" + Date.now();
                                Counter = Counter + 1;
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

    static SubmitCheckedAnswers(MarkedExercises) {
        const QueryString = window.location.search;
        const URLParams = new URLSearchParams(QueryString);
        const Identifier = URLParams.get('Identifier');

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/StudentsAnswers/UpdateTeacherMarking',
                type: 'POST',
                data: JSON.stringify({Identifier: Identifier, MarkedExercises: MarkedExercises}),
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
    static RenderStandardQuestionWithAnswer(Exercise) {
        const CorrectAnswerPercentage = (Math.round((Exercise.GainedPoints / Exercise.Points) * 100)).toString() + '%';
        if (Exercise.GainedPoints == 0) {
            Exercise.GainedPoints = '';
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

        const QuestionsWithAnswersList = document.getElementById('QuestionsWithAnswersList');
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
                UpdateUpperScoreCounter();
            }
            else {
                $(Question).find('.progress-bar').css('width', '0px');
                $(Question).find('.progress-bar').text('0%');
                ShowErrorModal(`Punktacja każdego pytania musi być uzupełniona poprawną liczbą całkowitą tzn. większą od zera i mniejszą lub równą niż maksymalna liczba punktów za zadanie.`);
            }
        });

        if (Exercise.ExerciseType == 'ProgrammingExercise' && Exercise.CodeAnswerContent != null) {
            const CodeAnswer = document.createElement('textarea');
            CodeAnswer.setAttribute('id', `Code-${Exercise.MainOrder}`);
            CodeAnswer.setAttribute('style', `display: none;`);
            $(CodeAnswer).insertBefore($(Question).find('.answer-points'));
            console.log(Exercise.CodeAnswerLanguage);

            if (Exercise.CodeAnswerLanguage == 'Python') {
                var Editor = CodeMirror.fromTextArea(document.getElementById(`Code-${Exercise.MainOrder}`), {
                    mode: 'python',
                    theme: 'yonce',
                    viewportMargin: '10',
                    lineNumbers: true
                }).setValue(Exercise.CodeAnswerContent);
            }
            else if (Exercise.CodeAnswerLanguage == 'Java') {
                var Editor = CodeMirror.fromTextArea(document.getElementById(`Code-${Exercise.MainOrder}`), {
                    mode: 'text/x-java',
                    theme: 'yonce',
                    viewportMargin: '10',
                    lineNumbers: true
                }).setValue(Exercise.CodeAnswerContent);
            }
            else if (Exercise.CodeAnswerLanguage == 'C++') {
                var Editor = CodeMirror.fromTextArea(document.getElementById(`Code-${Exercise.MainOrder}`), {
                    mode: 'text/x-c++src',
                    theme: 'yonce',
                    viewportMargin: '10',
                    lineNumbers: true
                }).setValue(Exercise.CodeAnswerContent);
            }
            else {
                var Editor = CodeMirror.fromTextArea(document.getElementById(`Code-${Exercise.MainOrder}`), {
                    mode: 'text/x-c++src',
                    theme: 'yonce',
                    viewportMargin: '10',
                    lineNumbers: true
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

    static RenderTrueFalseQuestionWithAnswer(Exercises) {
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

        const QuestionsWithAnswersList = document.getElementById('QuestionsWithAnswersList');
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
                    <input class="form-check-input" name="TrueFalseRadion-${Exercise.MainOrder}-${Exercise.SubOrder}" 
                        type="radio" value="true" checked />
                </div>
                <div class="form-check form-check-inline true-false-check">
                    <input class="form-check-input" name="TrueFalseRadion-${Exercise.MainOrder}-${Exercise.SubOrder}" 
                        type="radio" value="false" disabled />
                </div>`;
            }
            else {
                SubQuestion.innerHTML = `<div class="true-false-sub-question-content">
                    ${Exercise.ExerciseContent}
                </div>
                <div class="form-check form-check-inline true-false-check">
                    <input class="form-check-input" name="TrueFalseRadion-${Exercise.MainOrder}-${Exercise.SubOrder}" 
                        type="radio" value="true" disabled />
                </div>
                <div class="form-check form-check-inline true-false-check">
                    <input class="form-check-input" name="TrueFalseRadion-${Exercise.MainOrder}-${Exercise.SubOrder}" 
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

function ShowErrorModal(modalBody) {
    var ErrorModal = new bootstrap.Modal(document.getElementById('ErrorModal'));
    $('#ErrorModal .modal-body p').text(modalBody);
    ErrorModal.toggle();
}

function UpdateUpperScoreCounter() {
    let TotalGainedPointsByStudent = 0;
    $('.asnwer-points-input').each(function() {
        const ExerciseScore = parseInt($(this).val().trim());
        if (!isNaN(ExerciseScore)) {
            TotalGainedPointsByStudent = TotalGainedPointsByStudent + ExerciseScore;
        }
    });

    let resultColor = '';
    const PercentScore = Math.round((TotalGainedPointsByStudent / DataManagement.TotalPoints) * 100);
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
    $('#SubNavBar h2').last().html(`Wynik: <span style="color: ${resultColor} !important">${TotalGainedPointsByStudent} pkt. na ${DataManagement.TotalPoints} pkt. \u2014 ${PercentScore}%</span>`);
}

async function InitialLoad() {
    const AnswersData = await DataManagement.LoadUserAnswers();

    const FullName = AnswersData.FirstName + ' ' + AnswersData.LastName;
    $('#SubNavBar h2').first().html(`Uczeń: <span>${FullName}</span>`);
    $('#SubNavBar h2').first().next().html(`Data Przesłania: 
        <span>${AnswersData.SubmissionDate.replace('T', ' ').substring(0, 19)}</span>`);

    let TotalGainedPointsByStudent = 0;
    let TotalPoints = 0;
    for (let i = 0; i < AnswersData.Answers.length; i++) {
        if (i != AnswersData.Answers.length - 1) {
            if (AnswersData.Answers[i + 1].ExerciseType == "TrueFalseExercise" &&
                AnswersData.Answers[i].ExerciseType == "TrueFalseExercise")
            {
                TotalPoints = TotalPoints + AnswersData.Answers[i].Points;
                continue;
            }
        }

        TotalGainedPointsByStudent = TotalGainedPointsByStudent + AnswersData.Answers[i].GainedPoints;
        TotalPoints = TotalPoints + AnswersData.Answers[i].Points;
    };

    let resultColor = '';
    DataManagement.TotalPoints = TotalPoints;
    const PercentScore = Math.round((TotalGainedPointsByStudent / TotalPoints) * 100);
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
    $('#SubNavBar h2').last().html(`Wynik: <span style="color: ${resultColor} !important">${TotalGainedPointsByStudent} pkt. na ${TotalPoints} pkt. \u2014 ${PercentScore}%</span>`);

    let TrueFalseExercises = [];
    for (let i = 0; i < AnswersData.Answers.length; i++) {
        if (AnswersData.Answers[i].ExerciseType == 'TrueFalseExercise') {
            if (AnswersData.Answers[i + 1].ExerciseType != 'TrueFalseExercise') {
                TrueFalseExercises.push(AnswersData.Answers[i]);
                RenderContent.RenderTrueFalseQuestionWithAnswer(TrueFalseExercises);
                TrueFalseExercises = [];
            }
            else {
                TrueFalseExercises.push(AnswersData.Answers[i]);
                continue;
            }
        }
        else {
            RenderContent.RenderStandardQuestionWithAnswer(AnswersData.Answers[i]);
        }
    }

    DataManagement.LoadStudentsFiles();

    const SubmitButtonContainer = document.createElement('div');
    SubmitButtonContainer.classList.add('container');
    SubmitButtonContainer.innerHTML = `<div class="row justify-content-center">
        <div class="col-sm-12 col-lg-9 question-column">
            <button id="SaveMarkedAnswers" class="icon-button">
                <i class="fa-solid fa-angle-right"></i> Zapisz Poprawioną Pracę Ucznia <i class="fa-solid fa-spell-check"></i>
            </button>
        </div>
    </div>`;

    const QuestionsWithAnswersList = document.getElementById('QuestionsWithAnswersList');
    QuestionsWithAnswersList.append(SubmitButtonContainer);

    const tx = document.getElementsByClassName("comment");
    for (let i = 0; i < tx.length; i++) {
        tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
        tx[i].addEventListener("input", OnInput, false);
    }

    function OnInput() {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    }

    const $SaveButton = $('#SaveMarkedAnswers');
    $SaveButton.on('click', function(event) {
        event.preventDefault();
        let isSecondValidationPassed = true;
        let MarkedExercises = [];

        $('.container-exercise').each(function() {
            const PointsValue = parseInt($(this).find('.asnwer-points-input').val().trim());
            const MaxPointsValue = parseInt($(this).find('.asnwer-points-input').next().text().substring(2));

            if (isNaN(PointsValue) || PointsValue < 0 || PointsValue > MaxPointsValue) {
                var ErrorModal = new bootstrap.Modal(document.getElementById('ErrorModal'));
                $('#ErrorModal .modal-body p').text(`Punkty nie zostały wszędzie uzupełnione! Punktacja każdego pytania musi być uzupełnienie poprawną liczbą całkowitą tzn. większą od zera i mniejszą lub równą niż maksymalna liczba punktów za zadanie. Uzupełnij brakujące punkty i spróbuj ponownie.`);
                ErrorModal.toggle();

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

        console.log(isSecondValidationPassed);
        if (!isSecondValidationPassed) {
            return;
        }
        console.log(MarkedExercises);

        DataManagement.SubmitCheckedAnswers(MarkedExercises);
        var SuccessModal = new bootstrap.Modal(document.getElementById('SuccessModal'));
        SuccessModal.toggle();
    });
}

InitialLoad();

jQuery(function() {
    const $UpperNavbar = $('.navbar');
    const $BottomNavbar = $('#SubNavBar');

    const UpperNavbarHeight = $UpperNavbar.outerHeight();
    $BottomNavbar.css('top', `${UpperNavbarHeight}px`);
});