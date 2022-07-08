class DataManagement {
    static LoadUserSessions() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/Sessions/AllUserSessions',
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
    static SessionsBySets = null;
    static SessionsByDates = null;

    static CreateSessionsBySets() {
        this.SessionsBySets.forEach(SessionGroup => {
            const GroupHeader = document.createElement('div');
            GroupHeader.classList.add('list-groupper-header');
            GroupHeader.innerHTML = `<span>${SessionGroup[0].SetTitle}</span>
            <div class="list-groupper-header-divider"></div>`;

            const SessionsList = document.getElementById('SessionsList');
            SessionsList.append(GroupHeader);

            SessionGroup.forEach(Session => {
                const SessionShortcut = document.createElement('div');
                SessionShortcut.classList.add('session-shortcut');
                SessionShortcut.innerHTML = `<div class="session-shortcut-test-takers">
                    <div class="outer-circle-div">
                        <div class="inner-circle-div">
                            ${Session.TestTakersAmount}
                        </div>
                    </div>
                    <span>Oddane Prace Uczniów</span>
                </div>
                <div class="session-details">
                    <span class="takers-names">
                        ${Session.TestTakersNames}
                    </span>
                    <span class="session-title">
                        ${Session.SessionTitle}
                    </span>
                </div>
                <a class="session-shortcut-popup" href="/Sessions/Details?id=${Session.ID}">
                    <span>Przejdź do tej sesji</span>
                    <i class="fa-solid fa-arrow-up-right-dots"></i>
                </a>`;

                if (Session.StartDate > Date.now()) {
                    const CountdownTime = Session.StartDate.getTime();
                    const TimeNow = new Date().getTime();
                    const TimeLeft = CountdownTime - TimeNow;
                        
                    const Days = Math.floor(TimeLeft / (1000 * 60 * 60 * 24));
                    const Hours = Math.floor((TimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const Minutes = Math.floor((TimeLeft % (1000 * 60 * 60)) / (1000 * 60));

                    const SessionState = document.createElement('div');
                    SessionState.classList.add('session-state');
                    SessionState.classList.add('session-state-not-started');
                    SessionState.innerHTML = `<div class="outer-circle-div">
                        <div class="inner-circle-div">
                            <i class="fa-solid fa-hourglass"></i>
                        </div>
                    </div>
                    <span>Sesja Rozpocznie Się </br> Pozostało ${Days} Dni ${Hours} Godz. ${Minutes} Min.</span>`;

                    SessionShortcut.insertBefore(SessionState, $(SessionShortcut).find('.session-shortcut-popup')[0]);

                    const TimerFunction = setInterval(function() {
                        const TimeNow = new Date().getTime();
                        const TimeLeft = CountdownTime - TimeNow;
            
                        if (TimeLeft < 0) {
                            clearInterval(TimerFunction);
                            $(SessionState).find('span')[0].innerHTML = `Czas upłynął!`;
                        } 
                        else {
                            const Days = Math.floor(TimeLeft / (1000 * 60 * 60 * 24));
                            const Hours = Math.floor((TimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const Minutes = Math.floor((TimeLeft % (1000 * 60 * 60)) / (1000 * 60));
            
                            $(SessionState).find('span')[0].innerHTML = `Sesja Rozpocznie Się </br> 
                                Pozostało ${Days} Dni ${Hours} Godz. ${Minutes} Min.</span>`;
                        }
                    }, 60000);
                }
                else if (Session.ExpirationDate < Date.now()) {
                    const ExpirationDateString = Session.ExpirationDate.toISOString().substring(0, 10) + ' ' +
                        Session.ExpirationDate.toISOString().substring(11, 16);
                    const SessionState = document.createElement('div');
                    SessionState.classList.add('session-state');
                    SessionState.classList.add('session-state-finished');
                    SessionState.innerHTML = `<div class="outer-circle-div">
                        <div class="inner-circle-div">
                            <i class="fa-solid fa-hourglass"></i>
                        </div>
                    </div>
                    <span>
                        Sesja Zakończona </br> Została zakończona ${ExpirationDateString}  
                    </span>`;

                    SessionShortcut.insertBefore(SessionState, $(SessionShortcut).find('.session-shortcut-popup')[0]);
                }
                else {
                    const CountdownTime = Session.ExpirationDate.getTime();
                    const TimeNow = new Date().getTime();
                    const TimeLeft = CountdownTime - TimeNow;
                        
                    const Days = Math.floor(TimeLeft / (1000 * 60 * 60 * 24));
                    const Hours = Math.floor((TimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const Minutes = Math.floor((TimeLeft % (1000 * 60 * 60)) / (1000 * 60));

                    const SessionState = document.createElement('div');
                    SessionState.classList.add('session-state');
                    SessionState.classList.add('session-state-active');
                    SessionState.innerHTML = `<div class="outer-circle-div">
                        <div class="inner-circle-div">
                            <i class="fa-solid fa-hourglass"></i>
                        </div>
                    </div>
                    <span>Sesja Aktywna </br> Pozostało ${Days} Dni ${Hours} Godz. ${Minutes} Min.</span>`;

                    SessionShortcut.insertBefore(SessionState, $(SessionShortcut).find('.session-shortcut-popup')[0]);

                    const TimerFunction = setInterval(function() {
                        const TimeNow = new Date().getTime();
                        const TimeLeft = CountdownTime - TimeNow;
            
                        if (TimeLeft < 0) {
                            clearInterval(TimerFunction);
                            $(SessionState).find('span')[0].innerHTML = `Czas upłynął!`;
                        } 
                        else {
                            const Days = Math.floor(TimeLeft / (1000 * 60 * 60 * 24));
                            const Hours = Math.floor((TimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const Minutes = Math.floor((TimeLeft % (1000 * 60 * 60)) / (1000 * 60));
            
                            $(SessionState).find('span')[0].innerHTML = `Sesja Aktywna </br>
                                Pozostało ${Days} Dni ${Hours} Godz. ${Minutes} Min.`;
                        }
                    }, 60000);
                }

                SessionsList.append(SessionShortcut);
            });
        });
    }

    static CreateSessionsByDates() {
        for (const SessionsDateGroup in this.SessionsByDates) {
            if (this.SessionsByDates[SessionsDateGroup].length == 0) {
                continue;
            }

            const GroupHeader = document.createElement('div');
            GroupHeader.classList.add('list-groupper-header');

            switch (SessionsDateGroup) {
                case 'NotStarted':
                    GroupHeader.innerHTML = `<span>Jeszcze nie rozpoczęte</span>
                    <div class="list-groupper-header-divider"></div>`;
                    break;
                case 'TodayAndYesterday':
                    GroupHeader.innerHTML = `<span>Dziś i wczoraj</span>
                    <div class="list-groupper-header-divider"></div>`;
                    break;
                case 'LastWeek':
                    GroupHeader.innerHTML = `<span>Ostatni tydzień</span>
                    <div class="list-groupper-header-divider"></div>`;
                    break;   
                case 'LastMonth':
                    GroupHeader.innerHTML = `<span>Ostatni miesiąc</span>
                    <div class="list-groupper-header-divider"></div>`;
                    break;      
                case 'LastYear':
                    GroupHeader.innerHTML = `<span>Ostatni rok</span>
                    <div class="list-groupper-header-divider"></div>`;
                    break;  
                case 'Earlier':
                    GroupHeader.innerHTML = `<span>Dawniej niż rok</span>
                    <div class="list-groupper-header-divider"></div>`;
                    break;         
            }

            const SessionsList = document.getElementById('SessionsList');
            SessionsList.append(GroupHeader);

            this.SessionsByDates[SessionsDateGroup].forEach(Session => {
                const SessionShortcut = document.createElement('div');
                SessionShortcut.classList.add('session-shortcut');
                SessionShortcut.innerHTML = `<div class="session-shortcut-test-takers">
                    <div class="outer-circle-div">
                        <div class="inner-circle-div">
                            ${Session.TestTakersAmount}
                        </div>
                    </div>
                    <span>Oddane Prace Uczniów</span>
                </div>
                <div class="session-details">
                    <span class="takers-names">
                        ${Session.TestTakersNames}
                    </span>
                    <span class="session-title">
                        ${Session.SessionTitle}
                    </span>
                </div>
                <a class="session-shortcut-popup" href="/Sessions/Details?id=${Session.ID}">
                    <span>Przejdź do tej sesji</span>
                    <i class="fa-solid fa-arrow-up-right-dots"></i>
                </a>`;

                if (Session.StartDate > Date.now()) {
                    const CountdownTime = Session.StartDate.getTime();
                    const TimeNow = new Date().getTime();
                    const TimeLeft = CountdownTime - TimeNow;
                        
                    const Days = Math.floor(TimeLeft / (1000 * 60 * 60 * 24));
                    const Hours = Math.floor((TimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const Minutes = Math.floor((TimeLeft % (1000 * 60 * 60)) / (1000 * 60));

                    const SessionState = document.createElement('div');
                    SessionState.classList.add('session-state');
                    SessionState.classList.add('session-state-not-started');
                    SessionState.innerHTML = `<div class="outer-circle-div">
                        <div class="inner-circle-div">
                            <i class="fa-solid fa-hourglass"></i>
                        </div>
                    </div>
                    <span>Sesja Rozpocznie Się </br> Pozostało ${Days} Dni ${Hours} Godz. ${Minutes} Min.</span>`;

                    SessionShortcut.insertBefore(SessionState, $(SessionShortcut).find('.session-shortcut-popup')[0]);

                    const TimerFunction = setInterval(function() {
                        const TimeNow = new Date().getTime();
                        const TimeLeft = CountdownTime - TimeNow;
            
                        if (TimeLeft < 0) {
                            clearInterval(TimerFunction);
                            $(SessionState).find('span')[0].innerHTML = `Czas upłynął!`;
                        } 
                        else {
                            const Days = Math.floor(TimeLeft / (1000 * 60 * 60 * 24));
                            const Hours = Math.floor((TimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const Minutes = Math.floor((TimeLeft % (1000 * 60 * 60)) / (1000 * 60));
            
                            $(SessionState).find('span')[0].innerHTML = `Sesja Rozpocznie Się </br> 
                                Pozostało ${Days} Dni ${Hours} Godz. ${Minutes} Min.</span>`;
                        }
                    }, 60000);
                }
                else if (Session.ExpirationDate < Date.now()) {
                    const ExpirationDateString = Session.ExpirationDate.toISOString().substring(0, 10) + ' ' +
                        Session.ExpirationDate.toISOString().substring(11, 16);
                    const SessionState = document.createElement('div');
                    SessionState.classList.add('session-state');
                    SessionState.classList.add('session-state-finished');
                    SessionState.innerHTML = `<div class="outer-circle-div">
                        <div class="inner-circle-div">
                            <i class="fa-solid fa-hourglass"></i>
                        </div>
                    </div>
                    <span>
                        Sesja Zakończona </br> Została zakończona ${ExpirationDateString}  
                    </span>`;

                    SessionShortcut.insertBefore(SessionState, $(SessionShortcut).find('.session-shortcut-popup')[0]);
                }
                else {
                    const CountdownTime = Session.ExpirationDate.getTime();
                    const TimeNow = new Date().getTime();
                    const TimeLeft = CountdownTime - TimeNow;
                        
                    const Days = Math.floor(TimeLeft / (1000 * 60 * 60 * 24));
                    const Hours = Math.floor((TimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const Minutes = Math.floor((TimeLeft % (1000 * 60 * 60)) / (1000 * 60));

                    const SessionState = document.createElement('div');
                    SessionState.classList.add('session-state');
                    SessionState.classList.add('session-state-active');
                    SessionState.innerHTML = `<div class="outer-circle-div">
                        <div class="inner-circle-div">
                            <i class="fa-solid fa-hourglass"></i>
                        </div>
                    </div>
                    <span>Sesja Aktywna </br> Pozostało ${Days} Dni ${Hours} Godz. ${Minutes} Min.</span>`;

                    SessionShortcut.insertBefore(SessionState, $(SessionShortcut).find('.session-shortcut-popup')[0]);

                    const TimerFunction = setInterval(function() {
                        const TimeNow = new Date().getTime();
                        const TimeLeft = CountdownTime - TimeNow;
            
                        if (TimeLeft < 0) {
                            clearInterval(TimerFunction);
                            $(SessionState).find('span')[0].innerHTML = `Czas upłynął!`;
                        } 
                        else {
                            const Days = Math.floor(TimeLeft / (1000 * 60 * 60 * 24));
                            const Hours = Math.floor((TimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const Minutes = Math.floor((TimeLeft % (1000 * 60 * 60)) / (1000 * 60));
            
                            $(SessionState).find('span')[0].innerHTML = `Sesja Aktywna </br>
                                Pozostało ${Days} Dni ${Hours} Godz. ${Minutes} Min.`;
                        }
                    }, 60000);
                }

                SessionsList.append(SessionShortcut);
            });
        };
    }
}

function CheckEmptyListNotificationDisplay() {
    if ($('#SessionsList').height() == 0) {
        $('#SessionsEmptyList').css('display', 'flex');
    }
    else {
        $('#SessionsEmptyList').css('display', 'none');
    }
}

function CheckIfGroupHeadersNeeded() {
    $('.list-groupper-header').each(function() {
        const $CurrentGroupper = $(this);
        const $ThisHeaderSessions = $(this).nextUntil('.list-groupper-header');
        $ThisHeaderSessions.each(function() {
            if ($(this).css('display') == 'flex') {
                $CurrentGroupper.css('display', 'flex');
                return false;
            }
            else {
                $CurrentGroupper.css('display', 'none');
            }
        });
    });
}

async function InitialLoad() {
    const UserSessions = await DataManagement.LoadUserSessions();

    for (const SessionsDateGroup in UserSessions.SessionsGrouppedByDate) {
        UserSessions.SessionsGrouppedByDate[SessionsDateGroup].forEach(Session => {
            Session.ExpirationDate = new Date(Session.ExpirationDate);
            Session.StartDate = new Date(Session.StartDate);

            let NamesString = '';
            Session.TestTakersNames.forEach(Name => {
                NamesString = NamesString + ', ' + Name;
            });
            NamesString = NamesString.substring(2);
            Session.TestTakersNames = NamesString == '' ? 'Nie oddano jeszcze żadnej pracy...' : NamesString;

            if (Session.TestTakersNames.length > 55) {
                Session.TestTakersNames = Session.TestTakersNames.substring(0, 52) + '...';
            };
        });
    };

    for (const SessionsSetGroup of UserSessions.SessionsGrouppedBySet) {
        SessionsSetGroup.forEach(Session => {
            Session.ExpirationDate = new Date(Session.ExpirationDate);
            Session.StartDate = new Date(Session.StartDate);

            let NamesString = '';
            Session.TestTakersNames.forEach(Name => {
                NamesString = NamesString + ', ' + Name;
            });
            NamesString = NamesString.substring(2);
            Session.TestTakersNames = NamesString;
            Session.TestTakersNames = NamesString == '' ? 'Nie oddano jeszcze żadnej pracy...' : NamesString;

            if (Session.TestTakersNames.length > 55) {
                Session.TestTakersNames = Session.TestTakersNames.substring(0, 52) + '...';
            };
        });
    };

    RenderContent.SessionsByDates = UserSessions.SessionsGrouppedByDate;
    RenderContent.SessionsBySets = UserSessions.SessionsGrouppedBySet;

    RenderContent.CreateSessionsByDates();
    CheckEmptyListNotificationDisplay();
}

InitialLoad();

jQuery(function() {
    const $GrouppingSelect = $('.sorting-select');
    const $SessionsList = $('#SessionsList');
    const $SearchBar = $('.complex-input-shared input');

    $GrouppingSelect.on('change', function(event) {
        event.preventDefault();
        switch (event.target.value) {
            case '1':
                $SessionsList.html('');
                RenderContent.CreateSessionsByDates();
                break;
            case '2':
                $SessionsList.html('');
                RenderContent.CreateSessionsBySets();
                break;
        }
    });

    $SearchBar.on('keyup', function(event) {
        const SelectedOption = $('.sorting-select option').filter(':selected').val();
        if (SelectedOption == 2) {
            const $ShortcutTitles = $('.session-shortcut .session-details .session-title');
            $ShortcutTitles.each(function() {
                if ($(this).text().toLowerCase().includes(event.target.value.toLowerCase())) {
                    $(this).closest('.session-shortcut').css('display', 'flex');
                }
                else {
                    $(this).closest('.session-shortcut').css('display', 'none');
                }
            });
            CheckIfGroupHeadersNeeded();

            const $Grouppers = $('.list-groupper-header span');
            $Grouppers.each(function() {
                if ($(this).text().toLowerCase().includes(event.target.value.toLowerCase())) {
                    $(this).parent().css('display', 'flex');
                    $(this).parent().nextUntil('.list-groupper-header').css('display', 'flex');
                }
            });

            CheckEmptyListNotificationDisplay();
        }
        else {
            const $ShortcutTitles = $('.session-shortcut .session-details .session-title');
            $ShortcutTitles.each(function() {
                if ($(this).text().toLowerCase().includes(event.target.value.toLowerCase())) {
                    $(this).closest('.session-shortcut').css('display', 'flex');
                }
                else {
                    $(this).closest('.session-shortcut').css('display', 'none');
                }
            });
            CheckIfGroupHeadersNeeded();

            CheckEmptyListNotificationDisplay();
        }
    });
});