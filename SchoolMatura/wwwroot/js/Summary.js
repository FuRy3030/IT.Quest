class DataManagement {
    static LoadSummary() {
        const QueryString = window.location.search;
        const URLParams = new URLSearchParams(QueryString);
        const Identifier = URLParams.get('Code');

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: `/StudentsResults/SessionSummary`,
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

    static LoadSessionDetails() {
        const QueryString = window.location.search;
        const URLParams = new URLSearchParams(QueryString);
        const Identifier = URLParams.get('Code');

        return new Promise(function(resolve, reject) {
            $.ajax({
                url: `/StudentsResults/SessionDetails`,
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
}

async function InitialLoad() {
    const SessionSummary = await DataManagement.LoadSummary();
    const SessionDetails = await DataManagement.LoadSessionDetails();
    const StudentsCount = SessionSummary.length;
    let TableBodyArray = [];
    let TableHeaderArray = ['Imię i Nazwisko', 'Data Wysłania'];
    let SecondHeaderArray = [`'Max Punktów'`, '\u2014'];
    let MaxPointsSum = 0;

    $('#SubNavBar h2').first().html(`Nazwa: <span>${SessionDetails.SessionName}</span>`);
    $('#SubNavBar h2').first().next().html(`Data Wygaśnięcia: 
        <span>${SessionDetails.ExpirationTime.replace('T', ' ').substring(0, 19)}</span>`);
    $('#SubNavBar h2').last().html(`Liczba Uczniów: <span>${StudentsCount}</span>`);

    SessionSummary.forEach(Student => {
        let TotalPoints = 0;
        let SingleUserArray = [Student.Credentials, Student.TakerAnswerSubmissionDate.substring(0, 10) 
            + ' ' + Student.TakerAnswerSubmissionDate.substring(11, 16)];

        Student.Answers.forEach(Answer => {
            if (Answer.ScoredPoints == -1) {
                Answer.ScoredPoints = 0;
            }

            SingleUserArray.push(Answer.ScoredPoints);
            TotalPoints = TotalPoints + Answer.ScoredPoints;
        });

        SingleUserArray.push(TotalPoints);
        TableBodyArray.push(SingleUserArray);
    });

    SessionSummary[0].Answers.forEach(Answer => {
        if (Answer.SubOrder == null) {
            TableHeaderArray.push(`Zadanie ${Answer.MainOrder}`);
        }
        else {
            TableHeaderArray.push(`Zadanie ${Answer.MainOrder}.${Answer.SubOrder}`);
        }

        MaxPointsSum = MaxPointsSum + Answer.Points;
        SecondHeaderArray.push(Answer.Points);
    });
    SecondHeaderArray.push(MaxPointsSum);
    TableHeaderArray.push('Suma Punktów');
    TableBodyArray.push(SecondHeaderArray);

    const $UpperHeaderRow = $('#Summary thead tr').first();
    const $BottomHeader = $('#Summary tfoot tr').first();
    TableHeaderArray.forEach(Header => {
        const THElement = document.createElement('th');
        THElement.innerHTML = `${Header}`;
        $UpperHeaderRow[0].append(THElement);
    });

    TableHeaderArray.forEach(Header => {
        const THElement = document.createElement('th');
        THElement.innerHTML = `${Header}`;
        $BottomHeader[0].append(THElement);
    });

    // const $TableBody = $('#Summary tbody').first();
    // TableBodyArray.forEach(SingleRow => {
    //     const RowElement = document.createElement('tr');
    //     $TableBody[0].append(RowElement);
    //     SingleRow.forEach(DataPoint => {
    //         const SingleCellElement = document.createElement('td');
    //         SingleCellElement.innerHTML = `${DataPoint}`;
    //         RowElement.append(SingleCellElement);
    //     });
    // });

    $('#Summary').DataTable({
        // dom: 'lBfrtip',
        dom: "<'row gy-2'<'col-lg-6 col-xl-7 col-xxl-8'B><'col-sm-6 float-right col-lg-2 col-xxl-1'l><'col-sm-6 float-right col-lg-4 col-xl-3 col-xxl-3'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row gy-2'<'col-sm-12 col-md-6'i><'col-sm-12 col-md-6'p>>",
        responsive: true,
        data: TableBodyArray,
        buttons: [
            {
                extend: 'excel',
                text: `Pobierz Excel'a`,
                title: `${SessionDetails.SessionName} - Wyniki`,
                className: 'table_button',
            },
            {
                extend: 'csv',
                text: `Pobierz CSV'a`,
                title: `${SessionDetails.SessionName} - Wyniki`,
                className: 'table_button',
            },
            {
                extend: 'pdf',
                text: `Pobierz PDF'a`,
                title: `${SessionDetails.SessionName} - Wyniki`,
                className: 'table_button',
            },
            {
                extend: 'collection',
                text: 'Pozostałe',
                className: 'table_button',
                buttons: [
                    {
                        extend: 'copy',
                        title: `${SessionDetails.SessionName} - Wyniki`,
                        text: 'Skopiuj Zawartość',
                    },
                    {
                        extend: 'print',
                        title: `${SessionDetails.SessionName} - Wyniki`,
                        text: 'Drukuj',
                    }
                ]
            }
        ]
    });
}

InitialLoad();

jQuery(function() {
    const $UpperNavbar = $('.navbar');
    const $BottomNavbar = $('#SubNavBar');

    const UpperNavbarHeight = $UpperNavbar.outerHeight();
    $BottomNavbar.css('top', `${UpperNavbarHeight}px`);
});