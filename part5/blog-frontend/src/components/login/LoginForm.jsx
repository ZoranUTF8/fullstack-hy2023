import { useState } from "react";

import "./loginForm.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import * as LoginServices from "../../services/LoginService";
import * as localStorageOperations from "../../utils/localStorageOperations";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const LoginForm = ({ setUser, setRegistered }) => {
  const [userData, setUserData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await LoginServices.loginUser(userData);
      setUser(response);
      localStorageOperations.add_user_to_local_storage(response);
      toast.success("Successfully logged in.");
    } catch (error) {
      toast.error(error.response.data.msg);
    }
  };

  const handleChange = (e) => {
    setUserData((prevValues) => ({
      ...prevValues,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Form
      className="content mx-auto login-form_container text-center"
      onSubmit={handleSubmit}
    >
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Username</Form.Label>
        <Form.Control
          id="login-username"
          type="text"
          placeholder="Username"
          value={userData.username}
          name="username"
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          id="login-password"
          type="password"
          placeholder="Password"
          value={userData.password}
          name="password"
          onChange={handleChange}
        />
      </Form.Group>
      <p
        className="toggleLoginOption"
        onClick={() => setRegistered((prevValue) => !prevValue)}
      >
        Don't have an account?
      </p>
      <Button id="login-btn" variant="primary" type="submit">
        Login
      </Button>
    </Form>
  );
};

LoginForm.propTypes = {
  setUser: PropTypes.func.isRequired,
  setRegistered: PropTypes.func.isRequired,
};

export default LoginForm;
