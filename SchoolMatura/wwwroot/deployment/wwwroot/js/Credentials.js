function UploadNewCredentials(firstName, lastName) {
    $.ajax({
        url: '/Testing/SubmitCredentials',
        type: 'POST',
        data: JSON.stringify({FirstName: firstName, LastName: lastName}),
        contentType: 'application/json; charset=utf-8',
        success: function(response) {
            const FormattedResponse = JSON.parse(response);
            if (FormattedResponse.ResponseMessage.toString() == 'Success') {
                localStorage.setItem('TestTakerIdentifier', FormattedResponse.TestTakerIdentifier);
                window.location.href = '/Testing/Questions';
            }
            else {
                window.location.href = '/Home/Index';
            }
        }
    });
}

jQuery(function() {
    const $SubmitCredentialsButton = $('#SubmitCreditentialsButton');
    const $FirstNameInput = $('.border-input-group input').first();
    const $LastNameInput = $('.border-input-group input').last();

    $SubmitCredentialsButton.on('click', function(event) {
        event.preventDefault();
        const firstName = $FirstNameInput.val().trim();
        const lastName = $LastNameInput.val().trim();

        if (firstName == '' || lastName == '') {
            var ErrorModal = new bootstrap.Modal(document.getElementById('ErrorModal'));
            ErrorModal.show();
        }
        else {
            UploadNewCredentials(firstName, lastName);
        }
    });
});