class DataManagement {
    static LoadUserSets() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/Repository/LoadUserSets',
                type: 'GET',
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

    static RemoveSet(SetTitle) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/Repository/RemoveSet',
                type: 'POST',
                data: JSON.stringify({Title: SetTitle}),
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
    static CreateSetShortcut(SetTitle) {
        const Shortcut = document.createElement('div');
        Shortcut.classList.add('set-shortcut');
        Shortcut.innerHTML = `<span class="type-icon"><i class="fa-regular fa-rectangle-list"></i></span>
        <h4 class="set-title">${SetTitle}</h4>
        <span class="trash-icon"><i class="fa-solid fa-trash-can"></i></span>`;

        const ShortcutsList = document.getElementById('RepositoryItemsList');
        ShortcutsList.append(Shortcut);
    }

    static DisplaySetNumber(Count) {
        if (Count == 1) {
            $('#SetsCounter').html(`Aktualnie posiadasz <span style="color: #002eef;">${Count}</span> zestaw zadań`);
        }
        else if (Count > 1 && Count < 5) {
            $('#SetsCounter').html(`Aktualnie posiadasz <span style="color: #002eef;">${Count}</span> zestawy zadań`);
        }
        else {
            $('#SetsCounter').html(`Aktualnie posiadasz <span style="color: #002eef;">${Count}</span> zestawów zadań`);
        }
    }
}

function CheckEmptyListNotificationDisplay() {
    if ($('#RepositoryItemsList').height() == 0) {
        $('#ReposiotryEmptyList').css('display', 'flex');
    }
    else {
        $('#ReposiotryEmptyList').css('display', 'none');
    }
}

jQuery(function () {
    const $SearchBarInput = $('#RepositoryHeader input');
    const $CreateSetButton = $('#ReposiotryEmptyList button');
    let UserSetsCount = 0;

    try {
        DataManagement.LoadUserSets().then(SetTitles => {
            const titles = JSON.parse(SetTitles);
            UserSetsCount = titles.length;
            titles.forEach(title => {
                RenderContent.CreateSetShortcut(title);
            });

            RenderContent.DisplaySetNumber(titles.length);
            CheckEmptyListNotificationDisplay();

            $('.trash-icon i').each(function() {
                $(this).on('click', function(event) {
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    const title = $(this).parent().prev().text();
                    DataManagement.RemoveSet(title);
                    $(this).parent().parent().remove();
                    UserSetsCount = UserSetsCount - 1;

                    CheckEmptyListNotificationDisplay();
                    RenderContent.DisplaySetNumber(UserSetsCount);
                });
            });

            $('.set-shortcut').each(function() {
                $(this).on('click', function() {
                    const title = $(this).children('h4').text();
                    $SearchBarInput.val('');
                    localStorage.setItem('CurrentSetToOpen', title);
                    window.location.href = '/SetOverview/Overview';
                });
            });
        });
    }
    catch {
        //Do nothing
    }

    $SearchBarInput.on('keyup', function(event) {
        const $ShortcutTitles = $('.set-shortcut h4');
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

    $CreateSetButton.on('click', function(event) {
        event.preventDefault();
        $SearchBarInput.val('');
        window.location.href = "/CreateSet/NewSetPage";
    });
});