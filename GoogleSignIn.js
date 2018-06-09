import React from "react";
import * as Server from "./server";
import { getCurrentUser } from "./getCurrentUser";
import { withRouter } from "react-router";

window.gapi.load("auth2", () => {
  window.gapi.auth2.init({
    client_id:
      //CLIENT ID REMOVED
      ""
  });
});

var search = "";
var params = "";
var returnUrl = "";

class GoogleSignIn extends React.Component {
  componentDidMount() {
    window.gapi.signin2.render("my-signin2", {
      scope: "profile email",
      width: 220,
      height: 50,
      longtitle: true,
      theme: "dark",
      onsuccess: this.onSignIn,
      onfailure: this.onFailure
    });
  }

  onSignIn = googleUser => {
    var id_token = googleUser.getAuthResponse().id_token;
    Server.users_googleLogin({
      googleToken: id_token
    })
      .then(response => {
        getCurrentUser().then(() => {
          search = this.props.location.search;
          params = new URLSearchParams(search);
          returnUrl = params.get("returnurl");
          returnUrl
            ? this.props.history.push(returnUrl)
            : this.props.history.push("/home");
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  onFailure(error) {
    console.log(error);
  }

  onSignOut() {
    var auth2 = window.gapi.auth2.getAuthInstance();
    auth2.signOut().then(function() {
    });
  }

  revokeAccess() {
    var auth2 = window.gapi.auth2.getAuthInstance();
    auth2.disconnect().then(function() {
    });
  }

  render() {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div id="my-signin2" />
      </div>
    );
  }
}

export default withRouter(GoogleSignIn);