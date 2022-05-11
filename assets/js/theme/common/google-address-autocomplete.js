function initGoogleAddressAutocomplete() {
    const placeholderText = "Street Address or P.O Box";
    // Bounding box for the continental US + parts of Canada, Mexico, Bahamas, etc
    // Upate these values to bias results regionally
    const bounds = {
        north: 49.382808,
        south: 24.521208,
        east: -66.945392,
        west: -124.736342
    };
    const $input = $('[data-field-type=AddressLine1]');
    $input.attr("placeholder", placeholderText);
    const options = {
        bounds,
        componentRestrictions: { country: "us" },
        fields: ["address_components", "name"], // limit billing by only requesting specific fields
    };
    window.googleAddressAutocomplete = new google.maps.places.Autocomplete($input.get(0), options);
    window.googleAddressAutocomplete.addListener('place_changed', onGoogleAddressAutocompletePlaceChanged);
    window.gm_authFailure = function () {
        // Google Maps SDK calls gm_authFailure in the events of an invalid API key
        window.googleAddressAutocomplete = null;
        $input.removeAttr('disabled');
        $input.removeAttr('style');
        $input.attr("placeholder", placeholderText);
    }
 }

function getAddressFieldFromPlace(type, key) {
    const address_components = window.googleAddressAutocomplete.getPlace().address_components;

    if (!address_components) {
        return '';
    }

    const field = address_components && address_components.find(component => component.types.includes(type));

    if (field) {
        return field[key];
    }

    return '';
}

function onGoogleAddressAutocompletePlaceChanged() {
    console.log('in onGoogleAddressAutocompletePlaceChanged');
    const place = window.googleAddressAutocomplete.getPlace();

    if (!place.name) {
        return;
    }

    $('[data-field-type=AddressLine1]').val(place.name);
    $('[data-field-type=City]').val(getAddressFieldFromPlace('postal_town', 'long_name') ||
        getAddressFieldFromPlace('locality', 'long_name') ||
        getAddressFieldFromPlace('neighborhood', 'short_name'))
    $('[data-field-type=Country]').val(getAddressFieldFromPlace('country', 'long_name'));
    $('[data-field-type=State]').val(getAddressFieldFromPlace('administrative_area_level_1', 'long_name'));
    $('[data-field-type=Zip]').val(getAddressFieldFromPlace('postal_code', 'short_name'));
}

export default function googleAddressAutocomplete(googleApiKey) {
    console.log(googleApiKey)
    if(!googleApiKey) {
        return;
    }

    const url = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
    $.getScript(url, function( data, textStatus, jqxhr) {
            console.log(data, textStatus, jqxhr);
            initGoogleAddressAutocomplete();
        }
    );
}