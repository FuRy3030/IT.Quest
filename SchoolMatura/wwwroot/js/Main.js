class DataManagement {
    static LoadUserData() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/Dashboard/UserData',
                type: 'GET',
                contentType: 'application/json; charset=utf-8',
                success: function(data) {
                    const ParsedData = JSON.parse(data);
                    resolve(ParsedData);
                },
                error: function(err) {
                    reject(err);
                }
            });
        });
    }

    static LoadLiveSessions() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/Dashboard/UserLiveSessions',
                type: 'GET',
                contentType: 'application/json; charset=utf-8',
                success: function(data) {
                    const ParsedData = JSON.parse(data);
                    resolve(ParsedData);
                },
                error: function(err) {
                    reject(err);
                }
            });
        });
    }

    static LoadNotAndPartiallyGradedTestTakers() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/Dashboard/UserRecentTestTakers',
                type: 'GET',
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
}

class RenderContent {
    static RenderRecentElementShortcut(Element) {
        if (Element.Type == 'Set') {
            const RecentElementShortcut = document.createElement('div');
            RecentElementShortcut.classList.add('set-shortcut');
            RecentElementShortcut.classList.add('recent-element-shortcut');
            RecentElementShortcut.innerHTML = `<i class="fa-solid fa-folder-open"></i>
            <span class="title">${Element.Title}</span>
            <span class="date">${Element.Date.substring(0, 10) + ' ' + Element.Date.substring(11, 19)}</span>
            <i class="fa-solid fa-angle-right"></i>`;

            const RecentSets = document.getElementById('Sets');
            RecentSets.append(RecentElementShortcut);

            RecentElementShortcut.addEventListener('click', function() {
                localStorage.setItem('CurrentSetToOpen', Element.Title);
                window.location.href = '/SetOverview/Overview';
            });
        }
        else {
            const RecentElementShortcut = document.createElement('div');
            RecentElementShortcut.classList.add('exercise-shortcut');
            RecentElementShortcut.classList.add('recent-element-shortcut');
            RecentElementShortcut.innerHTML = `<i class="fa-regular fa-circle-question"></i>
            <span class="title">${Element.Title}</span>
            <span class="date">${Element.Date.substring(0, 10) + ' ' + Element.Date.substring(11, 19)}</span>
            <i class="fa-solid fa-angle-right"></i>`;

            const RecentExercises = document.getElementById('Exercises');
            RecentExercises.append(RecentElementShortcut);
        }
    }

    static RenderLiveSessionShortcut(SessionsGroups) {
        const LiveSessionsHeader = document.getElementById('LiveSessionsHeader');

        SessionsGroups.forEach(SessionsGroup => {
            SessionsGroup.Sessions.forEach(Session => {
                const LiveSessionShortcut = document.createElement('div');
                LiveSessionShortcut.classList.add('session-shortcut');
                LiveSessionShortcut.innerHTML = `<div class="session-shortcut-test-takers">
                    <div class="outer-circle-div">
                        <div class="inner-circle-div">
                            ${Session.TestTakersAmount}
                        </div>
                    </div>
                    <span>Oddane Prace Uczniów</span>
                </div>
                <div class="session-details">
                    <span class="session-title">
                        ${Session.SessionTitle}
                    </span>
                    <span class="time-left"></span>
                </div>`;

                const ShortcutPopUp = document.createElement('div');
                ShortcutPopUp.classList.add('session-shortcut-popup');
                ShortcutPopUp.innerHTML = `<span>Przejdź do tej sesji</span>
                    <i class="fa-solid fa-arrow-up-right-dots"></i>`;
                
                LiveSessionShortcut.append(ShortcutPopUp);

                InsertAfter(LiveSessionShortcut, LiveSessionsHeader);

                $(LiveSessionShortcut).children().each(function() {
                    $(this).height($(this).parent().height() - 32);
                });

                const CountdownTime = new Date(Session.ExpirationDate).getTime();
                const TimeNow = new Date().getTime();
                const TimeLeft = CountdownTime - TimeNow;
                    
                const Days = Math.floor(TimeLeft / (1000 * 60 * 60 * 24));
                const Hours = Math.floor((TimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const Minutes = Math.floor((TimeLeft % (1000 * 60 * 60)) / (1000 * 60));

                $(LiveSessionShortcut).find('.time-left')[0].innerHTML = 
                    `Pozostało ${Days} Dni ${Hours} Godz. ${Minutes} Min.`;

                const TimerFunction = setInterval(function() {
                    const TimeNow = new Date().getTime();
                    const TimeLeft = CountdownTime - TimeNow;

                    if (TimeLeft < 0) {
                        clearInterval(TimerFunction);
                        $(LiveSessionShortcut).find('.time-left')[0].innerHTML = `Czas upłynął!`;
                    } 
                    else {
                        const Days = Math.floor(TimeLeft / (1000 * 60 * 60 * 24));
                        const Hours = Math.floor((TimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const Minutes = Math.floor((TimeLeft % (1000 * 60 * 60)) / (1000 * 60));

                        $(LiveSessionShortcut).find('.time-left')[0].innerHTML = 
                            `Pozostało ${Days} Dni ${Hours} Godz. ${Minutes} Min.`;
                    }
                }, 60000);

                $(LiveSessionShortcut).on('click', function() {
                    window.location.href = `/Sessions/Details?id=${Session.SessionID}`;
                });
            });

            const GroupHeader = document.createElement('div');
            GroupHeader.classList.add('list-groupper-header');
            GroupHeader.innerHTML = `<span>${SessionsGroup.SetTitle}</span>
            <div class="list-groupper-header-divider"></div>`;

            InsertAfter(GroupHeader, LiveSessionsHeader);
        });
    }

    static RenderStudentsShortcuts(SessionTakers) {
        const PartiallyGradedStudentsHeader = document.getElementById('PartiallyGradedStudents');

        SessionTakers.PartiallyGraded.forEach(TakerGroup => {
            TakerGroup.SessionTakers.forEach(Taker => {
                const SubmissionDateString = toISOLocalString(Taker.SubmissionDate).substring(11, 16) + ' ' +
                    toISOLocalString(Taker.SubmissionDate).substring(0, 10);

                const StudentShortcut = document.createElement('div');
                StudentShortcut.classList.add('session-taker-shortcut');
                StudentShortcut.classList.add('partially-graded');
                StudentShortcut.innerHTML = `<div class="session-taker-details">
                    <span class="extra-info">Oddano ${SubmissionDateString}</span>
                    <span class="credentials">${Taker.Credentials}</span>
                </div>`;

                const MarkingInfo =  document.createElement('div');
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

                const ShortcutPopUp = document.createElement('div');
                ShortcutPopUp.classList.add('session-taker-shortcut-popup');
                ShortcutPopUp.innerHTML = `<span>Przejdź do oceniania</span>
                    <i class="fa-solid fa-user-graduate"></i>`;
                
                StudentShortcut.append(ShortcutPopUp);

                InsertAfter(StudentShortcut, PartiallyGradedStudentsHeader);

                $(StudentShortcut).on('click', function() {
                    window.location.href = `/Sessions/Details?id=${TakerGroup.SessionID}&takerId=${Taker.ID}`;
                });
            });

            const GroupHeader = document.createElement('div');
            GroupHeader.classList.add('list-groupper-header');
            GroupHeader.innerHTML = `<span>${TakerGroup.SessionName}</span>
            <div class="list-groupper-header-divider"></div>`;

            InsertAfter(GroupHeader, PartiallyGradedStudentsHeader);
        });

        SessionTakers.NotGraded.forEach(TakerGroup => {
            const NotGradedStudentsHeader = document.getElementById('NotGradedStudents');

            TakerGroup.SessionTakers.forEach(Taker => {
                const SubmissionDateString = toISOLocalString(Taker.SubmissionDate).substring(11, 16) + ' ' +
                    toISOLocalString(Taker.SubmissionDate).substring(0, 10);

                const StudentShortcut = document.createElement('div');
                StudentShortcut.classList.add('session-taker-shortcut');
                StudentShortcut.classList.add('not-graded');
                StudentShortcut.innerHTML = `<div class="session-taker-details">
                    <span class="extra-info">Oddano ${SubmissionDateString}</span>
                    <span class="credentials">${Taker.Credentials}</span>
                </div>`;

                const MarkingInfo =  document.createElement('div');
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

                const ShortcutPopUp = document.createElement('div');
                ShortcutPopUp.classList.add('session-taker-shortcut-popup');
                ShortcutPopUp.innerHTML = `<span>Przejdź do oceniania</span>
                    <i class="fa-solid fa-user-graduate"></i>`;
                
                StudentShortcut.append(ShortcutPopUp);

                InsertAfter(StudentShortcut, NotGradedStudentsHeader);

                $(StudentShortcut).on('click', function() {
                    window.location.href = `/Sessions/Details?id=${TakerGroup.SessionID}&takerId=${Taker.ID}`;
                });
            });

            const GroupHeader = document.createElement('div');
            GroupHeader.classList.add('list-groupper-header');
            GroupHeader.innerHTML = `<span>${TakerGroup.SessionName}</span>
            <div class="list-groupper-header-divider"></div>`;

            InsertAfter(GroupHeader, NotGradedStudentsHeader);
        });
    }
}

function InsertAfter(NewNode, ExistingNode) {
    ExistingNode.parentNode.insertBefore(NewNode, ExistingNode.nextSibling);
}

function toISOLocalString(GivenDate) {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(GivenDate - tzoffset)).toISOString().slice(0, -1);
}

function CheckIfSetsListIsEmpty() {
    const $NavbarExercisesShortcuts = $('.set-shortcut');
    if ($NavbarExercisesShortcuts.length == 0) {
        $('#NoSetsNotification').css('display', 'flex');
    }
    else {
        $('#NoSetsNotification').css('display', 'none');
    }
};

function CheckIfExercisesListIsEmpty() {
    const $NavbarSetsShortcuts = $('.exercise-shortcut');
    if ($NavbarSetsShortcuts.length == 0) {
        $('#NoExercisesNotification').css('display', 'flex');
    }
    else {
        $('#NoExercisesNotification').css('display', 'none');
    }
};

function CheckIfLiveSessionsListIsEmpty() {
    const $NavbarSetsShortcuts = $('.session-shortcut');
    if ($NavbarSetsShortcuts.length == 0) {
        $('#NoLiveSessionsNotification').css('display', 'flex');
    }
    else {
        $('#NoLiveSessionsNotification').css('display', 'none');
    }
};

function CheckIfNotGradedStudentsListIsEmpty() {
    const $NavbarSetsShortcuts = $('.not-graded');
    if ($NavbarSetsShortcuts.length == 0) {
        $('#NotGradedStudentsNotification').css('display', 'flex');
    }
    else {
        $('#NotGradedStudentsNotification').css('display', 'none');
    }
};

function CheckIfPartiallyGradedStudentsListIsEmpty() {
    const $NavbarSetsShortcuts = $('.partially-graded');
    if ($NavbarSetsShortcuts.length == 0) {
        $('#NoPartiallyGradedStudentsNotification').css('display', 'flex');
    }
    else {
        $('#NoPartiallyGradedStudentsNotification').css('display', 'none');
    }
};

async function InitialLoad() {
    const RecentElements = await DataManagement.LoadUserData();
    const LiveSessions = await DataManagement.LoadLiveSessions();
    const RecentTestTakers = await DataManagement.LoadNotAndPartiallyGradedTestTakers();

    [...RecentElements.Sets, ...RecentElements.Exercises].forEach(RecentElement => {
        RenderContent.RenderRecentElementShortcut(RecentElement);
    });

    RenderContent.RenderLiveSessionShortcut(LiveSessions);

    let PartiallyGradedAmount = 0;
    let NotGradedAmount = 0;

    RecentTestTakers.PartiallyGraded.forEach(TakerGroup => {
        TakerGroup.SessionTakers.forEach(Taker => {
            Taker.SubmissionDate = new Date(Taker.SubmissionDate);
            PartiallyGradedAmount = PartiallyGradedAmount + 1;
        });
        TakerGroup.SessionTakers.reverse();
    });

    RecentTestTakers.PartiallyGraded.reverse();

    RecentTestTakers.NotGraded.forEach(TakerGroup => {
        TakerGroup.SessionTakers.forEach(Taker => {
            Taker.SubmissionDate = new Date(Taker.SubmissionDate);
            NotGradedAmount = NotGradedAmount + 1;
        });
        TakerGroup.SessionTakers.reverse();
    });

    RecentTestTakers.NotGraded.reverse();

    RenderContent.RenderStudentsShortcuts(RecentTestTakers);

    const LiveSessionsAmount = LiveSessions.length;
    $('#LiveSessionsCounter').html(LiveSessionsAmount);
    if (LiveSessionsAmount > 9) {
        $('#LiveSessionsCounter').css('left', '83.75%');
    }

    $('#PartiallyGradedStudentsCounter').html(PartiallyGradedAmount);
    if (PartiallyGradedAmount > 9) {
        $('#PartiallyGradedStudentsCounter').css('left', '83.75%');
    }

    $('#NotGradedStudentsCounter').html(NotGradedAmount);
    if (NotGradedAmount > 9) {
        $('#NotGradedStudentsCounter').css('left', '83.75%');
    }

    CheckIfSetsListIsEmpty();
    CheckIfExercisesListIsEmpty();
    CheckIfLiveSessionsListIsEmpty();
    CheckIfPartiallyGradedStudentsListIsEmpty();
    CheckIfNotGradedStudentsListIsEmpty();
}

InitialLoad();

window.onload = function AssignElementsHeights() {
    const $Wrapper = $('#Wrapper');
    const $MainPanel = $('#MainPanel');
    const $RightPanel = $('#AdditionalRightPanel');

    const MainPanelHeight = $MainPanel.outerHeight() + window.innerHeight / 12;

    $RightPanel.css('height', `${MainPanelHeight}px`);
    $Wrapper.css('height', `${MainPanelHeight}px`);
    $RightPanel.css('max-height', `${MainPanelHeight}px`);
    $Wrapper.css('max-height', `${MainPanelHeight}px`);
    console.log(MainPanelHeight);
};