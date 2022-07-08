$('#Logo').on('click', function () {
    window.location.href = "/Home/Index";
});

$('#JoinTestHomeBox button').on('click', function(event) {
    event.preventDefault();
    console.log($(this).prev().val().trim());
    $.ajax({
        url: '/Home/IsCodeValid',
        type: 'POST',
        data: JSON.stringify({SessionIdentifier: $(this).prev().val().trim()}),
        contentType: 'application/json; charset=utf-8',
        success: function(response) {
            if (response == 'Success') {
                window.location.href = '/Testing/UserCredentials';
            }
            else {
                var ErrorModal = new bootstrap.Modal(document.getElementById('WrongUserCodeModal'));
                ErrorModal.show();
            }
        },
        error: function(err) {
            // Nothing
        }
    });
});
