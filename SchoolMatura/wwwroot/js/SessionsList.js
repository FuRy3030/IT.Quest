class DataManagement {
    static Sessions = null;

    static LoadSessions() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: `/StudentsResults/UserSessions`,
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
}

class RenderContent {
    static CreateSessionShortcut(SessionTitle, SessionExpiryDate, StudentsCount, SessionCode = '') {
        const Session = document.createElement('div');
        Session.classList.add('session');
        Session.innerHTML = `<span class="type-icon"><i class="fa-solid fa-calendar-days"></i></span>
        <h4 class="title">${SessionTitle}</h4>
        <h4 class="date">Wygasa ${SessionExpiryDate}</h4>
        <h4 class="session-blue students">${StudentsCount} Uczniów</h4>`;

        const SessionsList = document.getElementById('SessionsList');
        SessionsList.append(Session);

        $(Session).on('click', function() {
            window.location.href = `/StudentsResults/Summary?Code=${SessionCode}`;
        });
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

async function InitialLoad() {
    DataManagement.Sessions = await DataManagement.LoadSessions();
    DataManagement.Sessions.forEach(Session => {
        Session.ExpirationTime = new Date(Session.ExpirationTime);
        RenderContent.CreateSessionShortcut(Session.SessionName, 
            Session.ExpirationTime.toISOString().substring(0, 10) + ' ' +
            Session.ExpirationTime.toTimeString().substring(0, 5), 
            Session.StudentsNumber, Session.UniqueSessionCode);
    });
    console.log(DataManagement.Sessions);
    CheckEmptyListNotificationDisplay();
}

InitialLoad();

jQuery(function() {
    const $SearchBarInput = $('.complex-input-shared input');
    const $SortingSelect = $('.sorting-select');

    $SearchBarInput.on('keyup', function(event) {
        const $ShortcutTitles = $('.session .title');
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

    $SortingSelect.on('change', function(event) {
        const NewOption = event.target.value;
        switch(NewOption) {
            case '1':
                DataManagement.Sessions = QuickSortAlgorythm.QuickSort([...DataManagement.Sessions], 0, 
                    DataManagement.Sessions.length - 1, 'desc', 'ExpirationTime');
                
                $('#SessionsList').html('');
                DataManagement.Sessions.forEach(Session => {
                    RenderContent.CreateSessionShortcut(Session.SessionName, 
                        Session.ExpirationTime.toISOString().substring(0, 10) + ' ' +
                        Session.ExpirationTime.toTimeString().substring(0, 5), 
                        Session.StudentsNumber, Session.UniqueSessionCode);
                });

                CheckEmptyListNotificationDisplay();
                break;
            case '2':
                DataManagement.Sessions = QuickSortAlgorythm.QuickSort([...DataManagement.Sessions], 0, 
                    DataManagement.Sessions.length - 1, 'asc', 'ExpirationTime');
                
                $('#SessionsList').html('');
                DataManagement.Sessions.forEach(Session => {
                    RenderContent.CreateSessionShortcut(Session.SessionName, 
                        Session.ExpirationTime.toISOString().substring(0, 10) + ' ' +
                        Session.ExpirationTime.toTimeString().substring(0, 5), 
                        Session.StudentsNumber, Session.UniqueSessionCode);
                });

                CheckEmptyListNotificationDisplay();
                break;
            case '3':
                DataManagement.Sessions = QuickSortAlgorythm.QuickSort([...DataManagement.Sessions], 0, 
                    DataManagement.Sessions.length - 1, 'desc', 'StudentsNumber');  

                $('#SessionsList').html('');
                DataManagement.Sessions.forEach(Session => {
                    RenderContent.CreateSessionShortcut(Session.SessionName, 
                        Session.ExpirationTime.toISOString().substring(0, 10) + ' ' +
                        Session.ExpirationTime.toTimeString().substring(0, 5), 
                        Session.StudentsNumber, Session.UniqueSessionCode);
                });

                CheckEmptyListNotificationDisplay();
                break;
            case '4':
                DataManagement.Sessions = QuickSortAlgorythm.QuickSort([...DataManagement.Sessions], 0, 
                    DataManagement.Sessions.length - 1, 'asc', 'StudentsNumber');  
                    
                $('#SessionsList').html('');
                DataManagement.Sessions.forEach(Session => {
                    RenderContent.CreateSessionShortcut(Session.SessionName, 
                        Session.ExpirationTime.toISOString().substring(0, 10) + ' ' +
                        Session.ExpirationTime.toTimeString().substring(0, 5), 
                        Session.StudentsNumber, Session.UniqueSessionCode);
                });

                CheckEmptyListNotificationDisplay();
                break;
        }
    });
});