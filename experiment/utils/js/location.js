/**
 * Created by kgajos on 5/28/19.
 */


var locationUtilities = {

    country: null,

    getCountry: function(callback) {
        if (this.country)
            callback(this.country)
        else {
            var that = this;
            $.get("https://ipapi.co/country", function (data) {
                that.country = data;
                callback(data);
            });
        }
    }


};