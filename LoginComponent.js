import React from "react";
import "./signComponent.css";
import { showModal } from "./SmallModal";
import * as Axios from "./server";
import { Link } from "react-router-dom";
import { getCurrentUser } from "./getCurrentUser";
import GoogleSignIn from "./GoogleSignIn";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import injectStyles from "react-jss";

const styles = {
  "@global #page-content": {
    marginLeft: "0px !important"
  }
};

var search = "";
var params = "";
var returnUrl = "";

class LoginComponent extends React.Component {
  state = {
    email: "",
    emailError: "",
    password: "",
    passwordError: "",
    rememberMe: false
  };

  validate = () => {
    let isError = false;
    const errors = {
      emailError: "",
      passwordError: ""
    };

    if (this.state.email === "") {
      isError = true;
      errors.emailError = "The email field is required.";
    } else if (!/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i.test(this.state.email)) {
      isError = true;
      errors.emailError = "Provide a valid email.";
    }

    if (this.state.password === "") {
      isError = true;
      errors.passwordError = "The password field is required.";
    }

    this.setState({
      ...this.state,
      ...errors
    });

    return isError;
  };

  toggleRememberMe = () => {
    this.setState(prevState => ({ rememberMe: !prevState.rememberMe }));
  };

  buttonWasClicked = e => {
    e.preventDefault();
    const err = this.validate();
    if (!err) {
      Axios.users_Login({
        email: this.state.email,
        password: this.state.password,
        rememberMe: this.state.rememberMe
      })
        .then(response => {
          this.setState({
            email: "",
            password: "",
            emailError: "",
            passwordError: "",
            rememberMe: false
          });
          getCurrentUser().then(() => {
            returnUrl
              ? this.props.history.push(returnUrl)
              : this.props.history.push("/home");
          });
        })
        .catch(error => {
          showModal({
            modalStyle: "danger",
            title: "Failed",
            body: "Email password combination incorrect",
            closeButtonText: false,
            okButtonText: "Close"
          }).then(
            () => console.log("ok!"),
            () => console.log("closed " + error)
          );
        });
    }
  };

  render() {
    search = this.props.location.search;
    params = new URLSearchParams(search);
    returnUrl = params.get("returnurl");

    return (
      <div className="container">
        {this.props.currentUser ? (
          <Redirect to="/home" />
        ) : (
          <div className="LoginComponent page-sound row">
            <div className="col-md-4" />
            <div
              className={
                this.state.emailError || this.state.passwordError
                  ? "col-md-4 offset-md-3 well animated shake"
                  : "col-md-4 offset-md-3 well"
              }
              id="sign-wrapper"
            >
              <form
                className="sign-in form-horizontal shadow rounded no-overflow"
                action="dashboard.html"
                method="post"
              >
                <div className="sign-header">
                  <div className="form-group">
                    <div className="sign-text">
                      <span>Member Area</span>
                    </div>
                  </div>
                </div>
                <div className="sign-body">
                  <div className="form-group">
                    <div className="input-group input-group-lg rounded no-overflow">
                      <input
                        type="email"
                        className="form-control input-sm"
                        placeholder="Email "
                        name="email"
                        value={this.state.email}
                        onChange={e =>
                          this.setState({
                            email: e.target.value,
                            emailError: ""
                          })
                        }
                      />
                      <span className="input-group-addon">
                        <i className="fa fa-user" />
                      </span>
                      {this.state.emailError && (
                        <label
                          id="email-error"
                          className="error"
                          htmlFor="email"
                          style={{ display: "inline-block" }}
                        >
                          {this.state.emailError}
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group input-group-lg rounded no-overflow">
                      <input
                        type="password"
                        className="form-control input-sm"
                        placeholder="Password"
                        name="password"
                        value={this.state.password}
                        onChange={e =>
                          this.setState({
                            password: e.target.value,
                            passwordError: ""
                          })
                        }
                      />
                      <span className="input-group-addon">
                        <i className="fa fa-user" />
                      </span>
                      {this.state.passwordError && (
                        <label
                          id="password-error"
                          className="error"
                          htmlFor="password"
                          style={{ display: "inline-block" }}
                        >
                          {this.state.passwordError}
                        </label>
                      )}
                    </div>
                  </div>
                </div>
                <div className="sign-footer">
                  <div className="form-group">
                    <div className="row">
                      <div className="col-xs-6">
                        <div className="ckbox ckbox-theme">
                          <input
                            id="rememberMe"
                            type="checkbox"
                            checked={this.state.rememberMe}
                            onChange={this.toggleRememberMe}
                            value={this.state.rememberMe}
                          />
                          <label htmlFor="rememberMe" className="rounded">
                            Remember me
                          </label>
                        </div>
                      </div>
                      <div className="col-xs-6 text-right">
                        <Link to="/forgot-password"> Lost password? </Link>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <button
                      className="btn btn-theme btn-lg btn-block no-margin rounded"
                      id="login-btn"
                      onClick={this.buttonWasClicked}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </form>
              <p className="text-muted text-center sign-link">
                Need an account?{" "}
                <Link to={search ? "/register" + search : "/register"}>
                  {" "}
                  Sign up free{" "}
                </Link>{" "}
              </p>
              <GoogleSignIn />
            </div>
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.currentUser
  };
}

export default injectStyles(styles)(connect(mapStateToProps, null)(LoginComponent));

