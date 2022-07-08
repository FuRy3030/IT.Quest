class DataManagement {
    static CurrentFilesToUpload = {};

    static LoadQuestions() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: `/Testing/GetTakerQuestions?identifier=${localStorage.getItem('TestTakerIdentifier')}`,
                type: 'POST',
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

    static SubmitAnswers(UserAnswers, TakerToken) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/Testing/UpdateTakerAnswers',
                type: 'POST',
                data: JSON.stringify({UserAnswers: UserAnswers, TakerIdentifier: TakerToken}),
                contentType: 'application/json; charset=utf-8',
                success: function(response) {
                    if (response == 'Success') {
                        resolve(response);
                    }
                },
                error: function(err) {
                    reject(err);
                }
            });
        });
    }

    static SubmitFileAnswers(fileData) {
        $.ajax({
            type: "POST",
            url: "/Testing/SaveFileAnswers",
            contentType: false, 
            processData: false, 
            data: fileData
        });
    }

    static SubmitNoNCodeFileAnswers() {
        const FileData = new FormData();
        for (const [Order, File] of Object.entries(DataManagement.CurrentFilesToUpload)) {
            if (File != null && File != undefined) {
                const FileExtension = File.name.split('.')[1];
                const ModifiedFile = RenameFile(File, 
                    `${RenderContent.QuestionsData[0].TakerIdentifier}-${Order}.${FileExtension}`);
                FileData.append('Files', ModifiedFile);
            }
        }
        for (var value of FileData.values()) {
            console.log(value);
        }

        if (FileData.get('Files') != null && FileData.get('Files') != undefined) {
            $.ajax({
                type: "POST",
                url: "/Testing/SaveNonCodeFileAnswers",
                contentType: false, 
                processData: false, 
                data: FileData,
                success: function(response) {
                    console.log(response);
                },
                error: function() {
                    // nothing
                }
            });
        }
    }

    static async AutoSaveToLocalStorage() {
        const TempAnswers = [];
        const $PageContainers = $('#QuestionsList .container');
        let Counter = 1;
        
        $PageContainers.each(function() {
            if ($(this).hasClass('true-false')) {
                $(this).find('.true-false-sub-question').each(function() {
                    const RadioButtonValue = $(this).find('input:checked').val();
                    TempAnswers.push(RadioButtonValue);
                });
            }
            else {
                const QuestionAnswer = tinymce.get(`Answer-${Counter}`).getContent();
                TempAnswers.push(QuestionAnswer);
            }
            Counter = Counter + 1;
        });

        localStorage.setItem('AutoSavedAnswers', JSON.stringify(TempAnswers));
    }

    static async RestoreAnswers(SavedAnswers) {
        const $PageContainers = $('#QuestionsList .container');
        let ArrayPosition = 0;
        let Counter = 1;
        
        $PageContainers.each(function() {
            if ($(this).hasClass('true-false')) {
                $(this).find('.true-false-sub-question').each(function() {
                    $(this).find(`:radio[value=${SavedAnswers[ArrayPosition]}]`).prop("checked", true);
                    ArrayPosition = ArrayPosition + 1;
                });
            }
            else {
                tinymce.get(`Answer-${Counter}`).setContent(SavedAnswers[ArrayPosition]);
                ArrayPosition = ArrayPosition + 1;
            }
            Counter = Counter + 1;
        });
    }
}

class RenderContent {
    static CurrentPageNumber = 0;
    static LastPageIndex = 0;
    static QuestionsData = null;
    static CodeEditors = {};

    static RenderStandardQuestion(Exercise, QuestionOrder = 'NORMAL', QuestionType = '', AdditionalQuestionData) {
        const Question = document.createElement('div');
        Question.classList.add('container');
        Question.classList.add('standard');
        Question.setAttribute('id', `Exercise-${Exercise.MainOrder}`);
        Question.setAttribute('style', `display: none;`);
        Question.innerHTML = `<div class="row justify-content-center">
            <div class="col-sm-12 col-lg-8 question-column">
                <h1 class="question-header">Zadanie ${Exercise.MainOrder}</h1>
                <div class="question-content">
                    ${Exercise.Content}
                </div>
                <textarea id="Answer-${Exercise.MainOrder}"></textarea>
                <div class="navigation-buttons">
                </div>
            </div>
        </div>`;

        const QuestionsList = document.getElementById('QuestionsList');
        QuestionsList.append(Question);

        const windowHeight = window.innerHeight;
        const navbarHeight = $('.navbar').outerHeight(true);
        $(Question).css('min-height', `${windowHeight - navbarHeight}px`);

        if (QuestionType == 'ProgrammingExercise') {
            tinymce.init({
                selector: `textarea#Answer-${Exercise.MainOrder}`,
                resize: 'both',
                font_family_formats: `Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats; Nunito='Nunito', sans-serif`,
                plugins: 'wordcount autoresize',
                width: '100%',
                placeholder: "Wpisz swoją odpowiedź...",
            });

            const FirstAlertMessage = document.createElement('h2');
            FirstAlertMessage.classList.add('alert-clause');
            FirstAlertMessage.innerHTML = `Uwaga! W poniższe pole można wpisać jakiekolwiek uwagi, kometarze czy dodatkowe informacje, które zostaną przekazane wraz z zadaniem.`;
            $(FirstAlertMessage).insertAfter($(Question).find('.question-content'));

            const SecondAlertMessage = document.createElement('h2');
            SecondAlertMessage.classList.add('alert-clause');
            SecondAlertMessage.setAttribute('style', `margin-top: 3.5vh;`);
            SecondAlertMessage.innerHTML = `Uwaga! W przypadku braku załączonego pliku zawierającego kod, poniższe pole powinno zawierać jego działającą wersję stanowiącą odpowiedź do powyższego zadania.`;
            $(SecondAlertMessage).insertBefore($(Question).find('.question-column .navigation-buttons'));

            const CodeAnswer = document.createElement('textarea');
            CodeAnswer.setAttribute('id', `Code-${Exercise.MainOrder}`);
            CodeAnswer.setAttribute('style', `display: none;`);
            $(CodeAnswer).insertBefore($(Question).find('.question-column .navigation-buttons'));

            if (AdditionalQuestionData == '3') {
                var Editor = CodeMirror.fromTextArea(document.getElementById(`Code-${Exercise.MainOrder}`), {
                    mode: 'python',
                    theme: 'yeti',
                    viewportMargin: '10',
                    lineNumbers: true,
                    autoRefresh: true,
                    enterMode: "keep",
                    placeholder: 'Wpisz lub wklej tutaj swój kod będący odpowiedzią do zadania'
                });
                Editor.refresh();
                RenderContent.CodeEditors[`${Exercise.MainOrder}`] = Editor;
            }
            else if (AdditionalQuestionData == '2') {
                var Editor = CodeMirror.fromTextArea(document.getElementById(`Code-${Exercise.MainOrder}`), {
                    mode: 'text/x-java',
                    theme: 'yeti',
                    viewportMargin: '10',
                    lineNumbers: true,
                    autoRefresh: true,
                    placeholder: 'Wpisz lub wklej tutaj swój kod będący odpowiedzią do zadania'
                });
                Editor.refresh();
                RenderContent.CodeEditors[`${Exercise.MainOrder}`] = Editor;
            }
            else if (AdditionalQuestionData == '1') {
                var Editor = CodeMirror.fromTextArea(document.getElementById(`Code-${Exercise.MainOrder}`), {
                    mode: 'text/x-c++src',
                    theme: 'yeti',
                    viewportMargin: '10',
                    lineNumbers: true,
                    autoRefresh: true,
                    placeholder: 'Wpisz lub wklej tutaj swój kod będący odpowiedzią do zadania'
                });
                Editor.refresh();
                RenderContent.CodeEditors[`${Exercise.MainOrder}`] = Editor;
            }
            else {
                var Editor = CodeMirror.fromTextArea(document.getElementById(`Code-${Exercise.MainOrder}`), {
                    mode: 'text/x-c++src',
                    theme: 'yeti',
                    viewportMargin: '10',
                    lineNumbers: true,
                    autoRefresh: true,
                    placeholder: 'Wpisz lub wklej tutaj swój kod będący odpowiedzią do zadania'
                });
                Editor.refresh();
                RenderContent.CodeEditors[`${Exercise.MainOrder}`] = Editor;
            }

            const EditorObject = $(Question).find(".CodeMirror")[0];
            EditorObject.setAttribute("style", "height: auto; min-height: 100px; max-height: 700px; width: 100%");

            const FileSection = document.createElement('div');
            FileSection.classList.add('file-section');
            FileSection.innerHTML = `<h2 class="file-browser">
                Albo 
                <span class="file-button">
                    <span class="pure-text">Załącz Plik</span> 
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                </span> 
                z kodem jako odpowiedź...
            </h2>
            <input data-extensions="${AdditionalQuestionData}" class="form-control file-input" 
                type="file" id="SubmitFileAnswer" />`;

            const CurrentFileShortcut = document.createElement('div');
            CurrentFileShortcut.classList.add('current-file-shortcut');
            CurrentFileShortcut.innerHTML = `<i class="fa-solid fa-file-code"></i>
            <h5></h5>
            <i class="fa-regular fa-circle-check"></i>`;

            $(FileSection).insertBefore($(Question).find('.question-column .navigation-buttons'));
            $(CurrentFileShortcut).insertBefore($(Question).find('.question-column .navigation-buttons'));

            let Extensions = '';
            switch(AdditionalQuestionData) {
                case '0':
                    Extensions = '.cpp .cxx .cc .c++ .java .py .pyc';
                    break;
                case '1':
                    Extensions = '.cpp .cxx .cc .c++';
                    break;
                case '2':
                    Extensions = '.java';
                    break;
                case '3':
                    Extensions = '.py .pyc';
                    break;
            }

            $(Question).find('.file-browser .file-button').on('click', function(event) {
                event.preventDefault();
                $(this).parent().next()[0].click();
            });

            $(Question).find('.file-input')[0].addEventListener('change', function(event) {
                event.preventDefault();
                const CurrentFile = event.target.files[0];

                // File Details
                const Size = CurrentFile.size / 1024; // in KB
                const Name = CurrentFile.name;
                const FileExtension = Name.substring(Name.indexOf('.'));
                console.log(FileExtension);
                console.log(Name);

                if (Extensions.includes(FileExtension) && Size <= 50) {
                    $(CurrentFileShortcut).children('h5').text(Name.toString());
                    $(CurrentFileShortcut).css('display', 'flex');
                }
                else {
                    $(CurrentFileShortcut).css('display', 'none');
                    var ErrorModal = new bootstrap.Modal(document.getElementById('ErrorModal'));
                    ErrorModal.show();
                }
            });
        }
        else {
            switch (AdditionalQuestionData) {
                case '0':
                    tinymce.init({
                        selector: `textarea#Answer-${Exercise.MainOrder}`,
                        resize: 'both',
                        font_family_formats: `Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats; Nunito='Nunito', sans-serif`,
                        plugins: 'wordcount autoresize',
                        width: '100%',
                        placeholder: "Wpisz swoją odpowiedź...",
                    });
                    break;

                case '1':
                    $(Question).find('textarea').css('display', 'none');

                    const FileSectionNonCode = document.createElement('div');
                    FileSectionNonCode.classList.add('file-section-non-code');
                    FileSectionNonCode.innerHTML = `<div class="drag-drop">
                        <h1 class="drag-drop-header">Załącz swój plik jako odpowiedź</h1>
                        <h6 class="text-warning drag-drop-header-small">
                            Maksymalna wielkość pliku: 1 MB
                        </h6>
                        <div class="drag-area">
                            <img class="drag-big-icon" src="/images/folder-add.png" width="85" height="85" />
                            <h2 class="drag-drop-big">Przeciągnij & Upuść Swój Plik Tutaj</h2>
                            <h2 class="drag-drop-big">albo <button>Przeglądaj <i class="fa-solid fa-cloud-arrow-up"></i></button></h2>
                            <input type="file" hidden />
                            <h4 class="text-muted drag-drop-small">Wspierane Formaty: PDF, JPG, PNG, JPEG, DOCX, XLS, ACCDB...</h4>
                            <div class="drag-drop-small-icons">
                                <img src="/images/pdf.png" width="50" height="50" />
                                <img src="/images/jpg.png" width="50" height="50" />
                                <img src="/images/png.png" width="50" height="50" />
                                <img src="/images/jpeg.png" width="50" height="50" />
                                <img src="/images/docx-file.png" width="50" height="50" />
                                <img src="/images/xls-file.png" width="50" height="50" />
                                <img src="/images/access-file.png" width="50" height="50" />
                            </div>
                        </div>
                        <div class="uploaded-file">
                            <div class="uploaded-file-description">
                                <div style="width: 14%; display: flex; justify-content: center">
                                    <i class="fa-3x fa-solid fa-file-lines"></i>
                                </div>
                                <div style="width: 72%; text-align: left; margin-left: 10px; margin-right: 10px">
                                    <h2></h2>
                                    <div class="progress">
                                        <div class="progress-bar" role="progressbar" aria-valuenow="50" 
                                            aria-valuemin="0" aria-valuemax="100" style="width: 100%">
                                        </div>
                                    </div>
                                </div>
                                <div style="width: 14%; display: flex; justify-content: center">
                                    <i class="fa-3x fa-solid fa-circle-check"></i>
                                </div>
                            </div>
                        </div>
                    </div>`;
                    
                    $(FileSectionNonCode).insertBefore($(Question).find('.question-column .navigation-buttons'));

                    const $BrowseButton = $(Question).find('.drag-drop-big button');
                    const $HiddenInput = $(Question).find('.drag-area input');
                    const $DragArea = $(Question).find('.drag-area');
                    const $DragText = $(Question).find('.drag-drop-big').first();
                    const $UploadedFileShortcut = $(Question).find('.uploaded-file');
                    const Order = parseInt($DragArea.closest('.file-section-non-code').siblings('.question-header')
                        .text().substring(8));
                    let CurrentFile = null;

                    $BrowseButton.on('click', function(event) {
                        event.preventDefault();
                        $HiddenInput[0].click();
                    });
                
                    // Event Listeners - Browse Event
                
                    $HiddenInput[0].addEventListener('change', function(event) {
                        event.preventDefault();
                        CurrentFile = this.files[0];
                        $DragArea[0].classList.add('active');
                        // renderFileUploadHandler(currentFile);

                        const Size = CurrentFile.size / 1024 / 1024; // in MiB
                        const Name = CurrentFile.name;
                        if (Size <= 1.1) {
                            $UploadedFileShortcut.css('display', 'block');

                            if (Name.length >= 28) {
                                $UploadedFileShortcut.find('h2').text(Name.substring(0, 28).concat('...'));
                                $UploadedFileShortcut.find('h2').css('color', '#23293b');
                            }
                            else {
                                $UploadedFileShortcut.find('h2').text(Name.substring(0, 28));
                                $UploadedFileShortcut.find('h2').css('color', '#23293b');
                            }

                            $UploadedFileShortcut.find('.uploaded-file-description .progress-bar')
                                .attr('aria-valuenow', '100').text('100%').css('width', '100%')
                                .css('background-color', '#0d6efd');

                            $UploadedFileShortcut.find('.uploaded-file-description i')
                                .last()
                                .attr('class', 'fa-3x fa-solid fa-circle-check')
                                .attr('style', 'color: #004aad;');
                            
                            $UploadedFileShortcut.find('.uploaded-file-description i')
                                .first()
                                .attr('style', 'color: #004aad;');

                            DataManagement.CurrentFilesToUpload[Order] = CurrentFile;
                        }
                        else {
                            $UploadedFileShortcut.css('display', 'block');

                            if (Name.length >= 12) {
                                $UploadedFileShortcut.find('h2').text(Name.substring(0, 12)
                                    .concat('... - Plik jest za duży!'));
                                $UploadedFileShortcut.find('h2').css('color', '#EA2027');
                            }
                            else {
                                $UploadedFileShortcut.find('h2').text(Name.substring(0, 12)
                                    .concat(' - Plik jest za duży!'));
                                $UploadedFileShortcut.find('h2').css('color', '#EA2027');
                            }

                            const LoadNumber = Math.round(Math.random(1 , 100) * 100);
                            $UploadedFileShortcut.find('.uploaded-file-description .progress-bar')
                                .attr('aria-valuenow', `${LoadNumber}`)
                                .text(`${LoadNumber}%`).css('width', `${LoadNumber}%`)
                                .css('background-color', '#b71540');
                
                            $UploadedFileShortcut.find('.uploaded-file-description i')
                                .last()
                                .attr('class', 'fa-3x fa-solid fa-circle-exclamation')
                                .attr('style', 'color: #EA2027;');

                            $UploadedFileShortcut.find('.uploaded-file-description i')
                                .first()
                                .attr('style', 'color: #EA2027;');

                            DataManagement.CurrentFilesToUpload[Order] = null;
                        }
                    });
                
                    $DragArea[0].addEventListener('dragover', (event) => {
                        event.preventDefault();
                        $DragText[0].innerHTML = 'Upuść Swój Plik Tutaj';
                        $DragArea[0].classList.add('active');
                    });
                
                    $DragArea[0].addEventListener('dragleave', (event) => {
                        event.preventDefault();
                        $DragText[0].innerHTML = 'Przeciągnij & Upuść Swój Plik Tutaj';
                        $DragArea[0].classList.remove('active');
                    });
                
                    $DragArea[0].addEventListener('drop', (event) => {
                        event.preventDefault();
                        CurrentFile = event.dataTransfer.files[0];
                        // renderFileUploadHandler(currentFile);

                        const Size = CurrentFile.size / 1024 / 1024; // in MiB
                        const Name = CurrentFile.name;
                        if (Size <= 1.1) {
                            $UploadedFileShortcut.css('display', 'block');

                            if (Name.length >= 28) {
                                $UploadedFileShortcut.find('h2').text(Name.substring(0, 28).concat('...'));
                                $UploadedFileShortcut.find('h2').css('color', '#23293b');
                            }
                            else {
                                $UploadedFileShortcut.find('h2').text(Name.substring(0, 28));
                                $UploadedFileShortcut.find('h2').css('color', '#23293b');
                            }

                            $UploadedFileShortcut.find('.uploaded-file-description .progress-bar')
                                .attr('aria-valuenow', '100').text('100%').css('width', '100%')
                                .css('background-color', '#0d6efd');

                            $UploadedFileShortcut.find('.uploaded-file-description i')
                                .last()
                                .attr('class', 'fa-3x fa-solid fa-circle-check')
                                .attr('style', 'color: #004aad;');
                            
                            $UploadedFileShortcut.find('.uploaded-file-description i')
                                .first()
                                .attr('style', 'color: #004aad;');
                            
                            DataManagement.CurrentFilesToUpload[Order] = CurrentFile;
                        }
                        else {
                            $UploadedFileShortcut.css('display', 'block');

                            if (Name.length >= 12) {
                                $UploadedFileShortcut.find('h2').text(Name.substring(0, 12)
                                    .concat('... - Plik jest za duży!'));
                                $UploadedFileShortcut.find('h2').css('color', '#EA2027');
                            }
                            else {
                                $UploadedFileShortcut.find('h2').text(Name.substring(0, 12)
                                    .concat(' - Plik jest za duży!'));
                                $UploadedFileShortcut.find('h2').css('color', '#EA2027');
                            }

                            const LoadNumber = Math.round(Math.random(1 , 100) * 100);
                            $UploadedFileShortcut.find('.uploaded-file-description .progress-bar')
                                .attr('aria-valuenow', `${LoadNumber}`)
                                .text(`${LoadNumber}%`).css('width', `${LoadNumber}%`)
                                .css('background-color', '#b71540');
                
                            $UploadedFileShortcut.find('.uploaded-file-description i')
                                .last()
                                .attr('class', 'fa-3x fa-solid fa-circle-exclamation')
                                .attr('style', 'color: #EA2027;');

                            $UploadedFileShortcut.find('.uploaded-file-description i')
                                .first()
                                .attr('style', 'color: #EA2027;');

                            DataManagement.CurrentFilesToUpload[Order] = null;
                        }
                    });

                break;
            }
        }

        if (QuestionOrder == 'FIRST') {
            $(Question).css('display', 'block');

            const NextButton = document.createElement('button');
            NextButton.classList.add('icon-button');
            NextButton.innerHTML = `<i class="fa-solid fa-angle-right"></i> Następne Pytanie`;

            $(Question).find('.navigation-buttons')[0].append(NextButton);

            $(NextButton).on('click', function(event) {
                event.preventDefault();
                if (RenderContent.CurrentPageNumber != RenderContent.LastPageIndex) {
                    const $PageContainers = $('.container');
                    $PageContainers.each(function() {
                        $(this).css('display', 'none');
                    });
                    $PageContainers.eq(RenderContent.CurrentPageNumber + 1).css('display', 'block');
                    RenderContent.CurrentPageNumber = RenderContent.CurrentPageNumber + 1;
                    DataManagement.AutoSaveToLocalStorage();
                }
            });
        }
        else if (QuestionOrder == 'LAST') {
            const PreviousButton = document.createElement('button');
            PreviousButton.classList.add('icon-button');
            PreviousButton.classList.add('left-button');
            PreviousButton.innerHTML = `<i class="fa-solid fa-angle-left"></i> Poprzednie Pytanie`;

            $(Question).find('.navigation-buttons')[0].append(PreviousButton);

            $(PreviousButton).on('click', function(event) {
                event.preventDefault();
                if (RenderContent.CurrentPageNumber != 0) {
                    const $PageContainers = $('.container');
                    $PageContainers.each(function() {
                        $(this).css('display', 'none');
                    });
                    $PageContainers.eq(RenderContent.CurrentPageNumber - 1).css('display', 'block');
                    RenderContent.CurrentPageNumber = RenderContent.CurrentPageNumber - 1;
                    DataManagement.AutoSaveToLocalStorage();
                }
            });

            const SubmitButton = document.createElement('button');
            SubmitButton.classList.add('icon-button');
            SubmitButton.innerHTML = `Wyślij Rozwiązania <i class="fa-solid fa-check-double"></i>`;

            $(Question).find('.navigation-buttons')[0].append(SubmitButton);

            $(SubmitButton).on('click', function(event) {
                event.preventDefault();
                const $PageContainers = $('#QuestionsList .container');
                let Counter = 1;
                let ArrayPosition = 0;
                let UserAnswers = [];
                
                $PageContainers.each(function() {
                    if ($(this).hasClass('true-false')) {
                        $(this).find('.true-false-sub-question').each(function() {
                            const RadioButtonValue = $(this).find('input:checked').val();
                            const ExerciseWithAnswer = {
                                ExerciseId: RenderContent.QuestionsData[0].Exercises[ArrayPosition].ExerciseId,
                                Answer: RadioButtonValue
                            };
                            UserAnswers.push(ExerciseWithAnswer);
                            ArrayPosition = ArrayPosition + 1;
                        });
                    }
                    else {
                        let QuestionAnswer = null;
                        try {
                            QuestionAnswer = tinymce.get(`Answer-${Counter}`).getContent({ format: "text" });
                        }
                        catch {
                            QuestionAnswer = '';
                        }

                        const ExerciseWithAnswer = {
                            ExerciseId: RenderContent.QuestionsData[0].Exercises[ArrayPosition].ExerciseId,
                            Answer: QuestionAnswer
                        };
                        UserAnswers.push(ExerciseWithAnswer);
                        ArrayPosition = ArrayPosition + 1;
                    }
                    Counter = Counter + 1;
                });

                console.log(UserAnswers);
                DataManagement.SubmitAnswers(UserAnswers, RenderContent.QuestionsData[0].TakerIdentifier).then(() => {
                    let FileData = new FormData();

                    $('#QuestionsList').find('.current-file-shortcut').each(function() {
                        const Order = $(this).siblings('.question-header').text().substring(8);
                        let Extensions = $(this).prev().find('input').data('extensions').toString();
                        let Language = '';

                        switch(Extensions) {
                            case '0':
                                Language = 'Dowolny';
                                break;
                            case '1':
                                Language = 'C++';
                                break;
                            case '2':
                                Language = 'Java';
                                break;
                            case '3':
                                Language = 'Python';
                                break;
                        }

                        if ($(this).css('display') == 'flex') {
                            const File = $(this).prev().find('input')[0].files[0];

                            const reader = new FileReader();
                            reader.addEventListener('load', function (event) {
                                FileData.append('Codes', event.target.result.toString());
                                FileData.append('Languages', Language);
                                FileData.append('ExerciseOrders', Order);

                                FileData.append('Identifier', RenderContent.QuestionsData[0].TakerIdentifier);
                                DataManagement.SubmitFileAnswers(FileData);
                            });

                            reader.readAsText(File);
                        }
                        else {
                            FileData.append('Codes', RenderContent.CodeEditors[`${Order}`].getValue());
                            FileData.append('Languages', Language);
                            FileData.append('ExerciseOrders', Order);

                            FileData.append('Identifier', RenderContent.QuestionsData[0].TakerIdentifier);
                            DataManagement.SubmitFileAnswers(FileData);
                        }
                    });

                    DataManagement.SubmitNoNCodeFileAnswers();
                    localStorage.setItem('AutoSavedAnswers', '[]');
                    var SaveAnswersModal = new bootstrap.Modal(document.getElementById('SuccessSubmitModal'));
                    SaveAnswersModal.show();
                    window.addEventListener("click", function(event) {
                        event.preventDefault();
                        window.location.href = '/Home/Index';
                    });
                });
            });
        }
        else {
            const PreviousButton = document.createElement('button');
            PreviousButton.classList.add('icon-button');
            PreviousButton.classList.add('left-button');
            PreviousButton.innerHTML = `<i class="fa-solid fa-angle-left"></i> Poprzednie Pytanie`;

            $(Question).find('.navigation-buttons')[0].append(PreviousButton);

            $(PreviousButton).on('click', function(event) {
                event.preventDefault();
                if (RenderContent.CurrentPageNumber != 0) {
                    const $PageContainers = $('.container');
                    $PageContainers.each(function() {
                        $(this).css('display', 'none');
                    });
                    $PageContainers.eq(RenderContent.CurrentPageNumber - 1).css('display', 'block');
                    RenderContent.CurrentPageNumber = RenderContent.CurrentPageNumber - 1;
                    DataManagement.AutoSaveToLocalStorage();
                }
            });

            const NextButton = document.createElement('button');
            NextButton.classList.add('icon-button');
            NextButton.innerHTML = `<i class="fa-solid fa-angle-right"></i> Następne Pytanie`;

            $(Question).find('.navigation-buttons')[0].append(NextButton);

            $(NextButton).on('click', function(event) {
                event.preventDefault();
                if (RenderContent.CurrentPageNumber != RenderContent.LastPageIndex) {
                    const $PageContainers = $('.container');
                    $PageContainers.each(function() {
                        $(this).css('display', 'none');
                    });
                    $PageContainers.eq(RenderContent.CurrentPageNumber + 1).css('display', 'block');
                    RenderContent.CurrentPageNumber = RenderContent.CurrentPageNumber + 1;
                    DataManagement.AutoSaveToLocalStorage();
                }
            });
        }
    }

    static RenderTrueFalseQuestion(Exercises, QuestionOrder = 'NORMAL') {
        const Question = document.createElement('div');
        Question.classList.add('container');
        Question.classList.add('true-false');
        Question.setAttribute('id', `Exercise-${Exercises[0].MainOrder}`);
        Question.setAttribute('style', `display: none;`);
        Question.innerHTML = `<div class="row justify-content-center">
            <div class="col-sm-12 col-lg-8 question-column">
                <h1 class="question-header">Zadanie ${Exercises[0].MainOrder}</h1>
                <div class="question-sub-header">
                    <span class="long-span">Treść</span>
                    <span class="short-span">Prawda</span>
                    <span class="short-span">Fałsz</span>
                </div>
                <div class="question-content" style="margin-bottom: 0px">
                </div>
                <div class="navigation-buttons" style="margin-top: 1vh">
                </div>
            </div>
        </div>`;

        const QuestionsList = document.getElementById('QuestionsList');
        QuestionsList.append(Question);

        const windowHeight = window.innerHeight;
        const navbarHeight = $('.navbar').outerHeight(true);
        $(Question).css('min-height', `${windowHeight - navbarHeight}px`);

        Exercises.forEach(Exercise => {
            const SubQuestion = document.createElement('div');
            SubQuestion.classList.add('true-false-sub-question');
            SubQuestion.innerHTML = `<div class="true-false-sub-question-content">
                ${Exercise.Content}
            </div>
            <div class="form-check form-check-inline true-false-check">
                <input class="form-check-input" name="TrueFalseRadion-${Exercise.MainOrder}-${Exercise.SubOrder}" 
                    type="radio" value="true" />
            </div>
            <div class="form-check form-check-inline true-false-check">
                <input class="form-check-input" name="TrueFalseRadion-${Exercise.MainOrder}-${Exercise.SubOrder}" 
                    type="radio" value="false" />
            </div>`;

            $(Question).find('.question-content')[0].append(SubQuestion);
        });

        if (QuestionOrder == 'FIRST') {
            $(Question).css('display', 'block');

            const NextButton = document.createElement('button');
            NextButton.classList.add('icon-button');
            NextButton.innerHTML = `<i class="fa-solid fa-angle-right"></i> Następne Pytanie`;

            $(Question).find('.navigation-buttons')[0].append(NextButton);

            $(NextButton).on('click', function(event) {
                event.preventDefault();
                if (RenderContent.CurrentPageNumber != RenderContent.LastPageIndex) {
                    const $PageContainers = $('.container');
                    $PageContainers.each(function() {
                        $(this).css('display', 'none');
                    });
                    $PageContainers.eq(RenderContent.CurrentPageNumber + 1).css('display', 'block');
                    RenderContent.CurrentPageNumber = RenderContent.CurrentPageNumber + 1;
                    DataManagement.AutoSaveToLocalStorage();
                }
            });
        }
        else if (QuestionOrder == 'LAST') {
            const PreviousButton = document.createElement('button');
            PreviousButton.classList.add('icon-button');
            PreviousButton.classList.add('left-button');
            PreviousButton.innerHTML = `<i class="fa-solid fa-angle-left"></i> Poprzednie Pytanie`;

            $(Question).find('.navigation-buttons')[0].append(PreviousButton);

            $(PreviousButton).on('click', function(event) {
                event.preventDefault();
                if (RenderContent.CurrentPageNumber != 0) {
                    const $PageContainers = $('.container');
                    $PageContainers.each(function() {
                        $(this).css('display', 'none');
                    });
                    $PageContainers.eq(RenderContent.CurrentPageNumber - 1).css('display', 'block');
                    RenderContent.CurrentPageNumber = RenderContent.CurrentPageNumber - 1;
                    DataManagement.AutoSaveToLocalStorage();
                }
            });

            const SubmitButton = document.createElement('button');
            SubmitButton.classList.add('icon-button');
            SubmitButton.innerHTML = `Wyślij Rozwiązania <i class="fa-solid fa-check-double"></i>`;

            $(Question).find('.navigation-buttons')[0].append(SubmitButton);

            $(SubmitButton).on('click', function(event) {
                event.preventDefault();
                const $PageContainers = $('#QuestionsList .container');
                let Counter = 1;
                let ArrayPosition = 0;
                let UserAnswers = [];
                
                $PageContainers.each(function() {
                    if ($(this).hasClass('true-false')) {
                        $(this).find('.true-false-sub-question').each(function() {
                            const RadioButtonValue = $(this).find('input:checked').val();
                            const ExerciseWithAnswer = {
                                ExerciseId: RenderContent.QuestionsData[0].Exercises[ArrayPosition].ExerciseId,
                                Answer: RadioButtonValue
                            };
                            UserAnswers.push(ExerciseWithAnswer);
                            ArrayPosition = ArrayPosition + 1;
                        });
                    }
                    else {
                        let QuestionAnswer = null;
                        try {
                            QuestionAnswer = tinymce.get(`Answer-${Counter}`).getContent({ format: "text" });
                        }
                        catch {
                            QuestionAnswer = '';
                        }
            
                        const ExerciseWithAnswer = {
                            ExerciseId: RenderContent.QuestionsData[0].Exercises[ArrayPosition].ExerciseId,
                            Answer: QuestionAnswer
                        };
                        UserAnswers.push(ExerciseWithAnswer);
                        ArrayPosition = ArrayPosition + 1;
                    }
                    Counter = Counter + 1;
                });

                DataManagement.SubmitAnswers(UserAnswers, RenderContent.QuestionsData[0].TakerIdentifier).then(() => {
                    let FileData = new FormData();

                    $('#QuestionsList').find('.current-file-shortcut').each(function() {
                        const Order = $(this).siblings('.question-header').text().substring(8);
                        let Extensions = $(this).prev().find('input').data('extensions').toString();
                        let Language = '';

                        switch(Extensions) {
                            case '0':
                                Language = 'Dowolny';
                                break;
                            case '1':
                                Language = 'C++';
                                break;
                            case '2':
                                Language = 'Java';
                                break;
                            case '3':
                                Language = 'Python';
                                break;
                        }

                        if ($(this).css('display') == 'flex') {
                            const File = $(this).prev().find('input')[0].files[0];

                            const reader = new FileReader();
                            reader.addEventListener('load', function (event) {
                                FileData.append('Codes', event.target.result.toString());
                                FileData.append('Languages', Language);
                                FileData.append('ExerciseOrders', Order);

                                FileData.append('Identifier', RenderContent.QuestionsData[0].TakerIdentifier);
                                DataManagement.SubmitFileAnswers(FileData);
                            });

                            reader.readAsText(File);
                        }
                        else {
                            FileData.append('Codes', RenderContent.CodeEditors[`${Order}`].getValue());
                            FileData.append('Languages', Language);
                            FileData.append('ExerciseOrders', Order);

                            FileData.append('Identifier', RenderContent.QuestionsData[0].TakerIdentifier);
                            DataManagement.SubmitFileAnswers(FileData);
                        }
                    });

                    DataManagement.SubmitNoNCodeFileAnswers();
                    localStorage.setItem('AutoSavedAnswers', '[]');
                    var SaveAnswersModal = new bootstrap.Modal(document.getElementById('SuccessSubmitModal'));
                    SaveAnswersModal.show();
                    window.addEventListener("click", function(event) {
                        event.preventDefault();
                        window.location.href = '/Home/Index';
                    });
                });
            });
        }
        else {
            const PreviousButton = document.createElement('button');
            PreviousButton.classList.add('icon-button');
            PreviousButton.classList.add('left-button');
            PreviousButton.innerHTML = `<i class="fa-solid fa-angle-left"></i> Poprzednie Pytanie`;

            $(Question).find('.navigation-buttons')[0].append(PreviousButton);

            $(PreviousButton).on('click', function(event) {
                event.preventDefault();
                if (RenderContent.CurrentPageNumber != 0) {
                    const $PageContainers = $('.container');
                    $PageContainers.each(function() {
                        $(this).css('display', 'none');
                    });
                    $PageContainers.eq(RenderContent.CurrentPageNumber - 1).css('display', 'block');
                    RenderContent.CurrentPageNumber = RenderContent.CurrentPageNumber - 1;
                    DataManagement.AutoSaveToLocalStorage();
                }
            });

            const NextButton = document.createElement('button');
            NextButton.classList.add('icon-button');
            NextButton.innerHTML = `<i class="fa-solid fa-angle-right"></i> Następne Pytanie`;

            $(Question).find('.navigation-buttons')[0].append(NextButton);

            $(NextButton).on('click', function(event) {
                event.preventDefault();
                if (RenderContent.CurrentPageNumber != RenderContent.LastPageIndex) {
                    const $PageContainers = $('.container');
                    $PageContainers.each(function() {
                        $(this).css('display', 'none');
                    });
                    $PageContainers.eq(RenderContent.CurrentPageNumber + 1).css('display', 'block');
                    RenderContent.CurrentPageNumber = RenderContent.CurrentPageNumber + 1;
                    DataManagement.AutoSaveToLocalStorage();
                }
            });
        }
    }
}

function RenameFile(OriginalFile, NewName) {
    return new File([OriginalFile], NewName, {
        type: OriginalFile.type,
        lastModified: OriginalFile.lastModified,
    });
}

async function InitialLoad() {
    const QuestionsData = await DataManagement.LoadQuestions();
    RenderContent.QuestionsData = QuestionsData;
    RenderContent.LastPageIndex = QuestionsData[0].Exercises.length - 1;
    console.log(RenderContent.LastPageIndex);
    let TrueFalseExercises = [];
    for (let i = 0; i < QuestionsData[0].Exercises.length; i++) {
        if (QuestionsData[0].Exercises[i].ExerciseType == 'TrueFalseExercise' &&
            QuestionsData[0].Exercises[i].MainOrder == QuestionsData[0].Exercises[RenderContent.LastPageIndex].MainOrder) 
        {
            console.log('a');
            if (QuestionsData[0].Exercises[i + 1] == undefined || 
                QuestionsData[0].Exercises[i + 1].ExerciseType != 'TrueFalseExercise') 
            {
                TrueFalseExercises.push(QuestionsData[0].Exercises[i]);
                RenderContent.RenderTrueFalseQuestion(TrueFalseExercises, 'LAST');
                TrueFalseExercises = [];
                console.log('c');
            }
            else {
                TrueFalseExercises.push(QuestionsData[0].Exercises[i]);
                console.log('b');
                continue;
            }
        }
        else if (QuestionsData[0].Exercises[i].ExerciseType == 'TrueFalseExercise' &&
            QuestionsData[0].Exercises[i].MainOrder == 1) 
        {
            if (QuestionsData[0].Exercises[i + 1] == undefined || 
                QuestionsData[0].Exercises[i + 1].ExerciseType != 'TrueFalseExercise') 
            {
                TrueFalseExercises.push(QuestionsData[0].Exercises[i]);
                RenderContent.RenderTrueFalseQuestion(TrueFalseExercises, 'FIRST');
                TrueFalseExercises = [];
            }
            else {
                TrueFalseExercises.push(QuestionsData[0].Exercises[i]);
                continue;
            }
        }
        else if (QuestionsData[0].Exercises[i].ExerciseType == 'TrueFalseExercise') 
        {
            if (QuestionsData[0].Exercises[i + 1].ExerciseType != 'TrueFalseExercise') {
                TrueFalseExercises.push(QuestionsData[0].Exercises[i]);
                RenderContent.RenderTrueFalseQuestion(TrueFalseExercises);
                TrueFalseExercises = [];
            }
            else {
                TrueFalseExercises.push(QuestionsData[0].Exercises[i]);
                continue;
            }
        }
        else {
            if (i == 0) {
                RenderContent.RenderStandardQuestion(QuestionsData[0].Exercises[i], 'FIRST', 
                QuestionsData[0].Exercises[i].ExerciseType, QuestionsData[0].Exercises[i].AdditionalData);
            }
            else if (i == QuestionsData[0].Exercises.length - 1) {
                RenderContent.RenderStandardQuestion(QuestionsData[0].Exercises[i], 'LAST', 
                QuestionsData[0].Exercises[i].ExerciseType, QuestionsData[0].Exercises[i].AdditionalData);
            }
            else {
                RenderContent.RenderStandardQuestion(QuestionsData[0].Exercises[i], 'NORMAL', 
                    QuestionsData[0].Exercises[i].ExerciseType, QuestionsData[0].Exercises[i].AdditionalData);
            }
        }
    }

    if ($('#QuestionsList').children().length == 1) {
        $('#QuestionsList').children().first().css('display', 'block');
        $('.icon-button.left-button').css('display', 'none');
    }

    MathJax.typeset();
}

InitialLoad();

jQuery(function() {
    const $RestoreButton = $('#RestoreButton');
    const LastAnswers = JSON.parse(localStorage.getItem('AutoSavedAnswers'));

    try {
        if (LastAnswers.length > 0 && LastAnswers[0] != null && LastAnswers[0] != "" && LastAnswers[0] != undefined) {
            var AutoSaveModal = new bootstrap.Modal(document.getElementById('AutoSaveModal'));
            AutoSaveModal.show();
        }
    }
    catch {
        // Do nothing
    }

    $RestoreButton.on('click', function(event) {
        event.preventDefault();
        DataManagement.RestoreAnswers(LastAnswers);
    });
});
