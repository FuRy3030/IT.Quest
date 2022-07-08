class DataManagement {
    static LoadSetData() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/EditSet/LoadQuestionsList',
                type: 'POST',
                data: JSON.stringify({Title: localStorage.getItem('CurrentSetToOpen')}),
                contentType: 'application/json; charset=utf-8',
                success: function(data) {
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

    static ApplyChanges(ExercisesList, SetTitle) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/EditSet/LoadNewData',
                type: 'POST',
                data: JSON.stringify({
                    Title: SetTitle, 
                    Exercises: ExercisesList
                }),
                contentType: 'application/json; charset=utf-8',
                success: function(data) {
                    alert('success');
                    resolve(data);
                },
                error: function(err) {
                    alert('bad');
                    reject(err);
                }
            });
        });
    }
}

class RenderContent {
    static QuestionOrder = 1;
    static isPreviewVisible = {};
    static QuestionTypeSelected = '';

    static CreateQuestion(QuestionContent = '', QuestionType = 'default', Points = '', Hashtags = '', AdditionalData = '') {
        const UniqueNumber = Date.now();
        RenderContent.isPreviewVisible[UniqueNumber.toString()] = true;
        const Question = document.createElement('li');
        Question.classList.add('exercise');
        Question.classList.add(QuestionType);
        Question.innerHTML = `<div class="left-exercise-panel">
            <div class="input-group hashtags-input-group pietrowy-input-group">
                <span class="input-group-text" style="width: 100%">Liczba punktów:</span>
                <input type="text" value="${Points}" class="form-control" id="Points-${UniqueNumber}" placeholder="Max punktów za zadanie..." />
            </div>
            <div class="exercise-header">
                <h2 class="order current-order">Zadanie ${RenderContent.QuestionOrder}.</h2>
            </div>
            <div class="actions-list">
                <button class="actions-list-button">Usuń <i class="fa-solid fa-trash-can"></i></button>
                <button class="actions-list-button">Klonuj Pytanie <i class="fa-regular fa-clone"></i></button>
                <button class="actions-list-button">Tryb Edycji <i class="fa-solid fa-pen-to-square"></i></button>
                <button class="actions-list-button">Zapisz Zmiany <i class="fa-solid fa-check-double"></i></button>
            </div>
        </div>
        <div class="right-side-wrapper">
            <div class="input-group hashtags-input-group">
                <span class="input-group-text"><i class="fa-solid fa-hashtag"></i> Hashtags / Tags:</span>
                <input type="text" value="${Hashtags}" class="form-control hashtags" id="Hashtags-${UniqueNumber}" placeholder="Dodaj tematyczne tagi..." />
            </div>
            <textarea id="textarea-${UniqueNumber}" placeholder="Dodaj treść zadania...">
                ${QuestionContent}
            </textarea>
            <div class="saved-question-content" style="display: block;">
                <h2>Podgląd Treści Zadania</h2>
                <div>${QuestionContent}</div>
            </div>
        </div>`;

        if (QuestionType == 'programming') {
            const $OptionsList = $(Question).find('.actions-list');
            const ProgrammingLanguageSelect = document.createElement('select');
            ProgrammingLanguageSelect.classList.add('form-select');
            ProgrammingLanguageSelect.classList.add('actions-list-select');
            ProgrammingLanguageSelect.innerHTML = `<option value="0" selected>Odpowiedź w języku...</option>
                <option value="0">Dowolny</option>
                <option value="1">C++</option>
                <option value="2">Java</option>
                <option value="3">Python</option>`;

            $OptionsList[0].append(ProgrammingLanguageSelect);
            $(Question).find(`.actions-list-select option[value=${AdditionalData}]`).prop('selected', true);
        }
        else {
            const $OptionsList = $(Question).find('.actions-list');
            const AnswerModeSelect = document.createElement('select');
            AnswerModeSelect.classList.add('form-select');
            AnswerModeSelect.classList.add('actions-list-select');
            AnswerModeSelect.innerHTML = `<option value="0" selected>Odpowiedź w formie...</option>
                <option value="0">Tekstowa</option>
                <option value="1">Jako Plik</option>
                <option value="2">Pisemna</option>`;

            $OptionsList[0].append(AnswerModeSelect);
            $(Question).find(`.actions-list-select option[value=${AdditionalData}]`).prop('selected', true);
        }

        const QuestionList = document.getElementById('ExercisesList');
        QuestionList.append(Question);

        tinymce.init({
            selector: `textarea#textarea-${UniqueNumber}`,
            resize: 'both',
            font_family_formats: `Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats; Nunito='Nunito', sans-serif`,
            max_height: 1000,
            min_height: 200,
            height: '450px',
            min_width: 300,
            max_width: 1000,
            width: '100%',
            plugins: 'charmap image insertdatetime lists code wordcount codesample table link',
            toolbar: 'charmap | image | insertdatetime | numlist bullist | link | codesample | code | wordcount | table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol'
        });

        UpdateBottomNavbarCounter(RenderContent.QuestionOrder);
        RenderContent.QuestionOrder = RenderContent.QuestionOrder + 1;

        const $ButtonsList = $(Question).find('.actions-list-button');
        $ButtonsList.first().on('click', function(event) {
            event.preventDefault();
            $(Question).remove();
            RenderContent.QuestionOrder = RenderContent.QuestionOrder - 1;
            UpdateBottomNavbarCounter(RenderContent.QuestionOrder - 1);
            UpdateElementsMainOrder();
            ControlEmptyNotificationDisplay();
        });

        $ButtonsList.eq(1).on('click', function(event) {
            event.preventDefault();
            const Content = tinymce.get(`textarea-${UniqueNumber}`).getContent();
            RenderContent.CreateQuestion(Content);
        });

        $ButtonsList.eq(2).on('click', function(event) {
            event.preventDefault();
            if (RenderContent.isPreviewVisible[UniqueNumber.toString()] == true) {
                console.log('a');
                const $TextEditor = $(Question).find('.tox');
                const $Answer = $(Question).find('.saved-question-content');

                $TextEditor.addClass('displayFlexImportant');
                $Answer.css('display', 'none');
                RenderContent.isPreviewVisible[UniqueNumber.toString()] = false;
            }
        });

        $ButtonsList.last().on('click', function(event) {
            event.preventDefault();
            if (RenderContent.isPreviewVisible[UniqueNumber.toString()] == false) {
                const $TextEditor = $(Question).find('.tox');
                const $Answer = $(Question).find('.saved-question-content');

                const Content = tinymce.get(`textarea-${UniqueNumber}`).getContent();
                $Answer.children('div').html(Content);

                $TextEditor.removeClass('displayFlexImportant');
                $Answer.css('display', 'block');
                RenderContent.isPreviewVisible[UniqueNumber.toString()] = true;
            }
        });
    }

    static CreateQuestionTrueFalse(QuestionContent = '', QuestionSubNumber, QuestionMainNumber, UniqueClass, 
        $Node = null, Points = '', Hashtags = '', CorrectAnswer = '1') 
    {
        const UniqueNumber = Date.now() + QuestionSubNumber;
        RenderContent.isPreviewVisible[UniqueNumber.toString()] = true;
        const Question = document.createElement('li');
        Question.classList.add('exercise');
        Question.classList.add('true-false');
        Question.classList.add(UniqueClass);
        Question.innerHTML = `<div class="left-exercise-panel">
            <div class="input-group hashtags-input-group pietrowy-input-group">
                <span class="input-group-text" style="width: 100%">Liczba punktów:</span>
                <input type="text" value="${Points}" class="form-control" id="Points-${UniqueNumber}" placeholder="Max punktów za zadanie..." />
            </div>
            <div class="exercise-header">
                <h2 class="order ${UniqueClass.toString()}">Zadanie ${QuestionMainNumber}.${QuestionSubNumber}</h2>
            </div>
            <div class="actions-list">
                <button class="actions-list-button">Usuń <i class="fa-solid fa-trash-can"></i></button>
                <button class="actions-list-button">Klonuj Pytanie <i class="fa-regular fa-clone"></i></button>
                <button class="actions-list-button">Tryb Edycji <i class="fa-solid fa-pen-to-square"></i></button>
                <button class="actions-list-button">Zapisz Zmiany <i class="fa-solid fa-check-double"></i></button>
                <select class="form-select actions-list-select">
                    <option value="1" selected>Poprawna odpowiedź...</option>
                    <option value="0">Prawda</option>
                    <option value="1">Fałsz</option>
                </select>
            </div>
        </div>
        <div class="right-side-wrapper">
            <div class="input-group hashtags-input-group">
                <span class="input-group-text"><i class="fa-solid fa-hashtag"></i> Hashtags / Tags:</span>
                <input type="text" value="${Hashtags}" class="form-control hashtags" id="Hashtags-${UniqueNumber}" placeholder="Dodaj tematyczne tagi..." />
            </div>
            <textarea id="textarea-${UniqueNumber}" placeholder="Dodaj treść zadania...">
                ${QuestionContent}
            </textarea>
            <div class="saved-question-content" style="display: block;">
                <h2>Podgląd Treści Zadania</h2>
                <div>${QuestionContent}</div>
            </div>
        </div>`;

        if ($Node == null) {
            const QuestionList = document.getElementById('ExercisesList');
            QuestionList.append(Question);
        }
        else {
            $(Question).insertAfter($Node);
        }

        $(Question).find(`.actions-list-select option[value=${CorrectAnswer}]`).prop('selected', true);

        tinymce.init({
            selector: `textarea#textarea-${UniqueNumber}`,
            resize: 'both',
            font_family_formats: `Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats; Nunito='Nunito', sans-serif`,
            max_height: 1000,
            min_height: 200,
            height: '450px',
            min_width: 300,
            max_width: 1000,
            width: '100%',
            plugins: 'charmap image insertdatetime lists code wordcount codesample table link',
            toolbar: 'charmap | image | insertdatetime | numlist bullist | link | codesample | code | wordcount | table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol'
        });

        const $ButtonsList = $(Question).find('.actions-list-button');
        $ButtonsList.first().on('click', function(event) {
            event.preventDefault();
            if (!$(Question).prev().hasClass(UniqueClass) && !$(Question).next().hasClass(UniqueClass)) {
                $(Question).remove();
                RenderContent.QuestionOrder = RenderContent.QuestionOrder - 1;
                UpdateBottomNavbarCounter(RenderContent.QuestionOrder - 1);
                UpdateElementsMainOrder();
                ControlEmptyNotificationDisplay();
            }
            else {
                $(Question).remove();
                UpdateElementsSubOrder();
            }
        });

        $ButtonsList.eq(1).on('click', function(event) {
            event.preventDefault();
            let i = 1, isNumberEncountered = false;
            let $LastNode, LastNodeNumber;
            const CurrentMainNumber = $(Question).find('.order').text()
                .substring(8, $(Question).find('.order').text().indexOf('.'));
            
            $('.exercise .order').each(function() {
                const QuestionMainNumber = $(this).text().substring(8, $(this).text().indexOf('.')); 
                if (QuestionMainNumber == CurrentMainNumber.toString() && !isNumberEncountered) {
                    isNumberEncountered = true;
                }

                if (QuestionMainNumber != CurrentMainNumber.toString() && isNumberEncountered) { 
                    return false;
                }

                if (isNumberEncountered) {
                    LastNodeNumber = i;
                    $LastNode = $(this).closest('.exercise');
                    i++;
                }
            });

            const Content = tinymce.get(`textarea-${UniqueNumber}`).getContent();
            RenderContent.CreateQuestionTrueFalse(Content, LastNodeNumber + 1, CurrentMainNumber, UniqueClass, $LastNode);
        });

        $ButtonsList.eq(2).on('click', function(event) {
            event.preventDefault();
            if (RenderContent.isPreviewVisible[UniqueNumber.toString()] == true) {
                const $TextEditor = $(Question).find('.tox');
                const $Answer = $(Question).find('.saved-question-content');

                $TextEditor.addClass('displayFlexImportant');
                $Answer.css('display', 'none');
                RenderContent.isPreviewVisible[UniqueNumber.toString()] = false;
            }
        });

        $ButtonsList.last().on('click', function(event) {
            event.preventDefault();
            if (RenderContent.isPreviewVisible[UniqueNumber.toString()] == false) {
                const $TextEditor = $(Question).find('.tox');
                const $Answer = $(Question).find('.saved-question-content');

                const Content = tinymce.get(`textarea-${UniqueNumber}`).getContent();
                $Answer.children('div').html(Content);

                $TextEditor.removeClass('displayFlexImportant');
                $Answer.css('display', 'block');
                RenderContent.isPreviewVisible[UniqueNumber.toString()] = true;
            }
        });
    }

    static ShowErrorModal(modalBody) {
        var ErrorModal = new bootstrap.Modal(document.getElementById('ErrorModal'));
        $('#ErrorModal .modal-body p').text(modalBody);
        ErrorModal.toggle();
    }
}

function UpdateBottomNavbarCounter(Counter) {
    if (Counter > 1 && Counter < 5) {
        $('#SubNavBar h2')
            .html(`W obecnym zestawie znajdują się <span>${Counter}</span> zadania`);
    }
    else if (Counter == 1) {
        $('#SubNavBar h2')
            .html(`W obecnym zestawie znajduje się <span>${Counter}</span> zadanie`);
    }
    else {
        $('#SubNavBar h2')
            .html(`W obecnym zestawie znajduje się <span>${Counter}</span> zadań`);
    }
}

function ControlEmptyNotificationDisplay() {
    if ($('#ExercisesList').children().length == 0) {
        $('.empty-list').css('display', 'flex');
    }
    else {
        $('.empty-list').css('display', 'none');
    }
}

function UpdateElementsMainOrder() {
    let isPreviousStringSimpleNumber = false;
    let CurrentOrder = 0;
    let PrevClassIdentifier = '';
    let CurrentClassIdentifier = '';

    $('.exercise .order').each(function() {
        CurrentClassIdentifier = $(this).attr("class").split(/\s+/)[1];

        if ($(this).text().substring($(this).text().indexOf('.') + 1) == '') {
            CurrentOrder = CurrentOrder + 1;
            $(this).text(`Zadanie ${CurrentOrder}.`);
            isPreviousStringSimpleNumber = true;
            PrevClassIdentifier = CurrentClassIdentifier;
        }

        else if (isPreviousStringSimpleNumber && CurrentClassIdentifier != PrevClassIdentifier) {
            CurrentOrder = CurrentOrder + 1;
            $(this).text(`Zadanie ${CurrentOrder}${$(this).text().substring($(this).text().indexOf('.'))}`);
            isPreviousStringSimpleNumber = false;
            PrevClassIdentifier = CurrentClassIdentifier;
        }

        else if (CurrentClassIdentifier == PrevClassIdentifier) {
            $(this).text(`Zadanie ${CurrentOrder}${$(this).text().substring($(this).text().indexOf('.'))}`);
            PrevClassIdentifier = CurrentClassIdentifier;
        }

        else {
            CurrentOrder = CurrentOrder + 1;
            $(this).text(`Zadanie ${CurrentOrder}${$(this).text().substring($(this).text().indexOf('.'))}`);
            PrevClassIdentifier = CurrentClassIdentifier;
        }
    });
}

function UpdateElementsSubOrder() {
    let isPreviousStringSimpleNumber = false;
    let CurrentSubOrder = 0;
    let PrevClassIdentifier = '';
    let CurrentClassIdentifier = '';

    $('.exercise .order').each(function() {
        CurrentClassIdentifier = $(this).attr("class").split(/\s+/)[1];

        if ($(this).text().substring($(this).text().indexOf('.') + 1) == '') {
            CurrentSubOrder = 0;
            isPreviousStringSimpleNumber = true;
            PrevClassIdentifier = CurrentClassIdentifier;
        }

        else if (isPreviousStringSimpleNumber && CurrentClassIdentifier != PrevClassIdentifier) {
            CurrentSubOrder = CurrentSubOrder + 1;
            $(this).text(`Zadanie ${$(this).text().substring(8, $(this).text().indexOf('.'))}.${CurrentSubOrder}`);
            isPreviousStringSimpleNumber = false;
            PrevClassIdentifier = CurrentClassIdentifier;
        }

        else if (CurrentClassIdentifier == PrevClassIdentifier) {
            CurrentSubOrder = CurrentSubOrder + 1;
            $(this).text(`Zadanie ${$(this).text().substring(8, $(this).text().indexOf('.'))}.${CurrentSubOrder}`);
            PrevClassIdentifier = CurrentClassIdentifier;
        }

        else {
            CurrentSubOrder = 1;
            $(this).text(`Zadanie ${$(this).text().substring(8, $(this).text().indexOf('.'))}.${CurrentSubOrder}`);
            PrevClassIdentifier = CurrentClassIdentifier;
        }
    });
}

async function InitialLoad() {
    try {
        const CurrentSetData = await DataManagement.LoadSetData();
        let UniqueNumber = 0;
        console.log(CurrentSetData);
        CurrentSetData.Exercises.forEach(exercise => {
            switch(exercise.ExerciseType) {
                case 'StandardExercise':
                    RenderContent.CreateQuestion(exercise.Content, 'default', exercise.Points, 
                        exercise.Hashtags == null ? '' : exercise.Hashtags, exercise.AdditionalData);
                    break;
                case 'ProgrammingExercise':
                    RenderContent.CreateQuestion(exercise.Content, 'programming', exercise.Points, 
                        exercise.Hashtags == null ? '' : exercise.Hashtags, exercise.AdditionalData);
                    break;
                case 'TrueFalseExercise':
                    if (exercise.SubOrder == 1) {
                        UniqueNumber = Date.now();
                    }

                    RenderContent.QuestionOrder = exercise.MainOrder;
                    RenderContent.CreateQuestionTrueFalse(exercise.Content, exercise.SubOrder, 
                        RenderContent.QuestionOrder, UniqueNumber, null, exercise.Points, 
                        exercise.Hashtags == null ? '' : exercise.Hashtags, exercise.CorrectAnswer);
                    RenderContent.QuestionOrder = RenderContent.QuestionOrder + 1;
                    break;
            }
        });

        $('#Title').val(CurrentSetData.Title);
        $('#Description').val(CurrentSetData.Description);        
    }
    catch {
        // error
    }
}

InitialLoad();

jQuery(function () {
    const $ExerciseTypeButtons = $('.question-types span');
    const $AddExerciseButton = $('#AddExerciseButton');
    const $UpperNavbar = $('.navbar');
    const $BottomNavbar = $('#SubNavBar');
    const $TrueFalseCreateButton = $('#TrueFalseCreate');
    const $SaveSetButton = $('#SubNavBar button');
    let TrueFalseModal;

    const UpperNavbarHeight = $UpperNavbar.outerHeight();
    $BottomNavbar.css('top', `${UpperNavbarHeight}px`);

    $ExerciseTypeButtons.each(function() {
        $(this).on('click', function() {
            if (!$(this).hasClass('active-question-type')) {
                $ExerciseTypeButtons.removeClass('active-question-type');
                $(this).addClass('active-question-type');
                RenderContent.QuestionTypeSelected = $(this).text().trim();
            }
        });
    });

    $AddExerciseButton.on('click', function() {
        if (RenderContent.QuestionTypeSelected == 'Programistyczne') {
            RenderContent.CreateQuestion('', 'programming');
            ControlEmptyNotificationDisplay();
        }
        else if (RenderContent.QuestionTypeSelected == 'Prawda / Fałsz') {
            TrueFalseModal = new bootstrap.Modal(document.getElementById('TrueFalseModal'));
            TrueFalseModal.toggle();
        }
        else {
            RenderContent.CreateQuestion();
            ControlEmptyNotificationDisplay();
        }
    });

    $TrueFalseCreateButton.on('click', function() {
        const QuestionsNumber = $('#TrueFalseInputGroup input').val().trim();
        try {
            if (parseInt(QuestionsNumber) < 10) {
                $('.warning').css('display', 'none');
                TrueFalseModal.toggle();

                const UniqueNumber = Date.now();
                for (let i = 1; i < parseInt(QuestionsNumber) + 1; i++) {
                    RenderContent.CreateQuestionTrueFalse('', i, RenderContent.QuestionOrder, UniqueNumber);
                }

                UpdateBottomNavbarCounter(RenderContent.QuestionOrder);
                RenderContent.QuestionOrder = RenderContent.QuestionOrder + 1;
                ControlEmptyNotificationDisplay();
            }
            else {
                throw 'Bigger than 10';
            }
        }
        catch {
            $('.warning').css('display', 'block');
        }
    });

    $SaveSetButton.on('click', function(event) {
        event.preventDefault();   
        let isSecondValidationPassed = true;   
        const ExercisesArray = [];

        $('.exercise').each(function() {
            if ($(this).find('.saved-question-content div').html() == '') {
                RenderContent.ShowErrorModal(`Treść żadnego z zadań nie może być pusta. Nadaj każdemu treść i spróbuj ponownie.`);
                isSecondValidationPassed = false;
                return false;
            }

            if (parseInt($(this).find('.pietrowy-input-group input').val().trim()) == NaN || 
                parseInt($(this).find('.pietrowy-input-group input').val().trim()) <= 0) 
            {
                RenderContent.ShowErrorModal(`Liczba punktów musi być określona dla każdego zadania i musi być większa od zera liczbą całkowitą. Nadaj każdemu z nich odpowiednią liczbę punktów i spróbuj ponownie.`);
                isSecondValidationPassed = false;
                return false;
            }

            if ($(this).hasClass('default')) {
                let ExerciseOrder = $(this).find('.order').text();
                ExerciseOrder = parseInt(ExerciseOrder.substring(8, ExerciseOrder.indexOf('.')));
                const Exercise = {
                    type: 'StandardExercise',
                    mainOrder: ExerciseOrder,
                    subOrder: null,
                    content: $(this).find('.saved-question-content div').html(),
                    correctAnswer: null,
                    additionalData: $(this).find('.actions-list-select').val(),
                    points: parseInt($(this).find('.pietrowy-input-group input').val().trim()),
                    hashtags: $(this).find('.hashtags').val().trim()
                };

                ExercisesArray.push(Exercise);
            }

            else if ($(this).hasClass('programming')) {
                let ExerciseOrder = $(this).find('.order').text();
                ExerciseOrder = parseInt(ExerciseOrder.substring(8, ExerciseOrder.indexOf('.')));
                const Exercise = {
                    type: 'ProgrammingExercise',
                    mainOrder: ExerciseOrder,
                    subOrder: null,
                    content: $(this).find('.saved-question-content div').html(),
                    correctAnswer: null,
                    additionalData: $(this).find('.actions-list-select').val(),
                    points: parseInt($(this).find('.pietrowy-input-group input').val().trim()),
                    hashtags: $(this).find('.hashtags').val().trim()
                };

                ExercisesArray.push(Exercise);
            }

            else {
                let ExerciseOrder = $(this).find('.order').text();
                const ExerciseSubOrder = parseInt(ExerciseOrder.substring(ExerciseOrder.indexOf('.') + 1));
                ExerciseOrder = parseInt(ExerciseOrder.substring(8, ExerciseOrder.indexOf('.')));
                const Exercise = {
                    type: 'TrueFalseExercise',
                    mainOrder: ExerciseOrder,
                    subOrder: ExerciseSubOrder,
                    content: $(this).find('.saved-question-content div').html(),
                    correctAnswer: $(this).find('.actions-list-select').val(),
                    additionalData: null,
                    points: parseInt($(this).find('.pietrowy-input-group input').val().trim()),
                    hashtags: $(this).find('.hashtags').val().trim()
                };

                ExercisesArray.push(Exercise);
            }
        });

        if (!isSecondValidationPassed) {
            return;
        }

        DataManagement.ApplyChanges(ExercisesArray, localStorage.getItem('CurrentSetToOpen')).then(() => {
            window.location.href = '/SetOverview/Overview';
        });
    });
});