import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import { Form, Input, Button } from "antd";

import { Endpoints } from "../../routes";
import { authenticateGitHub } from "../../store/user";

import "./style.css";

type FieldType = {
  login?: string;
  token?: string;
};

export function Login() {
  const dispatch = useDispatch();
  let navigate = useNavigate()
  const { status } = useSelector((state) => state.user);

  const onFinish = async (values: any) => {
    const { login, token } = values;

    const res = await dispatch(authenticateGitHub({ login, token }));

    if (res.payload) {
      navigate(Endpoints.REPOS)
    }
  };

  return (
    <main className="container">
      <Form
        name="auth"
        labelCol={{ span: 9 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 800 }}
        onFinish={onFinish}
        initialValues={{
          login: "Dmi3ii2018",
        }}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Login"
          name="login"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="GitHub Token"
          name="token"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item label={null}>
          <Button
            type="primary"
            htmlType="submit"
            disabled={status === "loading"}
            loading={status === "loading"}
          >
            OK
          </Button>
        </Form.Item>
      </Form>
    </main>
  );
}
