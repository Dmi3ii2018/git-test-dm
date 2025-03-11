import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, useMatches, useActionData, useLoaderData, useParams, useRouteError, Meta, Links, ScrollRestoration, Scripts, Outlet, isRouteErrorResponse, useNavigate } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { createElement, useState, useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { createAsyncThunk, createSlice, configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import { Form, Input, Alert, Button, Modal, Select, message, Spin, Descriptions, Table, Space, Layout as Layout$1, Avatar } from "antd";
import { index, route } from "@react-router/dev/routes";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
function withComponentProps(Component) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      matches: useMatches()
    };
    return createElement(Component, props);
  };
}
function withErrorBoundaryProps(ErrorBoundary3) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      error: useRouteError()
    };
    return createElement(ErrorBoundary3, props);
  };
}
const initialState$1 = {
  repositories: [],
  selectedRepo: {
    data: null,
    status: "idle",
    error: null
  },
  status: "idle",
  error: null
};
const fetchRepositories = createAsyncThunk(
  "github/fetchRepositories",
  async ({ login: login2, token }, { rejectWithValue }) => {
    var _a, _b;
    try {
      const response = await axios.get(`https://api.github.com/users/${login2}/repos`, {
        headers: { Authorization: `token ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Ошибка при загрузке репозиториев");
    }
  }
);
const updateRepository = createAsyncThunk(
  "repo/updateRepository",
  async ({ login: login2, token, repoName, data }, { rejectWithValue }) => {
    var _a, _b;
    try {
      const response = await axios.patch(`https://api.github.com/repos/${login2}/${repoName}`, data, {
        headers: { Authorization: `token ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Ошибка при обновлении репозитория");
    }
  }
);
const deleteRepository = createAsyncThunk(
  "repo/deleteRepository",
  async ({ login: login2, token, repoName }, { rejectWithValue }) => {
    var _a, _b;
    try {
      await axios.delete(`https://api.github.com/repos/${login2}/${repoName}`, {
        headers: { Authorization: `token ${token}` }
      });
      return repoName;
    } catch (error) {
      return rejectWithValue(((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Ошибка при удалении репозитория");
    }
  }
);
const fetchRepositoryDetails = createAsyncThunk(
  "repo/fetchRepositoryDetails",
  async ({ login: login2, token, repoName }, { rejectWithValue }) => {
    var _a, _b;
    try {
      const response = await axios.get(`https://api.github.com/repos/${login2}/${repoName}`, {
        headers: { Authorization: `token ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Ошибка при получении данных репозитория");
    }
  }
);
const createRepository = createAsyncThunk(
  "repo/createRepository",
  async ({ login: login2, token, name, description, visibility }, { rejectWithValue }) => {
    var _a, _b;
    try {
      const response = await axios.post(
        `https://api.github.com/user/repos`,
        {
          name,
          description,
          private: visibility === "private"
        },
        {
          headers: { Authorization: `token ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Ошибка при создании репозитория");
    }
  }
);
const githubSlice = createSlice({
  name: "repo",
  initialState: initialState$1,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchRepositories.pending, (state) => {
      state.status = "loading";
    }).addCase(fetchRepositories.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.repositories = action.payload;
    }).addCase(fetchRepositories.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    }).addCase(updateRepository.fulfilled, (state, action) => {
      state.repositories = state.repositories.map(
        (repo) => repo.id === action.payload.id ? action.payload : repo
      );
    }).addCase(deleteRepository.fulfilled, (state, action) => {
      state.repositories = state.repositories.filter((repo) => repo.name !== action.payload);
    }).addCase(fetchRepositoryDetails.fulfilled, (state, action) => {
      state.selectedRepo.status = "succeeded";
      state.selectedRepo.data = action.payload;
    }).addCase(fetchRepositoryDetails.pending, (state) => {
      state.selectedRepo.status = "loading";
    }).addCase(fetchRepositoryDetails.rejected, (state) => {
      state.selectedRepo.error = "failed";
    }).addCase(createRepository.fulfilled, (state, action) => {
      state.repositories = [action.payload, ...state.repositories];
    });
  }
});
const reposReducer = githubSlice.reducer;
const initialState = {
  user: null,
  status: "idle",
  error: null,
  token: null
};
const authenticateGitHub = createAsyncThunk(
  "auth/authenticateGitHub",
  async ({ login: login2, token }) => {
    const response = await axios.get(`https://api.github.com/users/${login2}`, {
      headers: {
        Authorization: `token ${token}`
      }
    });
    return { response: response.data, token };
  }
);
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.status = "idle";
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(authenticateGitHub.pending, (state) => {
      state.status = "loading";
    }).addCase(authenticateGitHub.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.user = action.payload.response;
      state.token = action.payload.token;
    }).addCase(authenticateGitHub.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    });
  }
});
const { logout } = authSlice.actions;
const userReducer = authSlice.reducer;
const store = configureStore({
  reducer: {
    repos: reposReducer,
    user: userReducer
  }
});
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Provider, {
    store,
    children: /* @__PURE__ */ jsx(Outlet, {})
  });
});
const ErrorBoundary = withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message2 = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message2 = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message2
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root
}, Symbol.toStringTag, { value: "Module" }));
const Endpoints = {
  REPOS: "repos"
};
[
  index("routes/login.tsx"),
  route(Endpoints.REPOS, "routes/repos.tsx")
];
function LoginPage() {
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const { status, error } = useSelector((state) => state.user);
  const onFinish = async (values) => {
    const { login: login2, token } = values;
    const res = await dispatch(authenticateGitHub({ login: login2, token }));
    if (res.payload) {
      navigate(Endpoints.REPOS);
    }
  };
  const isLoading = status === "loading";
  return /* @__PURE__ */ jsx("main", { className: "container", children: /* @__PURE__ */ jsxs(
    Form,
    {
      name: "auth",
      labelCol: { span: 9 },
      wrapperCol: { span: 16 },
      style: { maxWidth: 800 },
      onFinish,
      autoComplete: "off",
      requiredMark: true,
      children: [
        /* @__PURE__ */ jsx(
          Form.Item,
          {
            label: "Login",
            name: "login",
            rules: [{ required: true, message: "Please input your username!" }],
            children: /* @__PURE__ */ jsx(Input, {})
          }
        ),
        /* @__PURE__ */ jsx(
          Form.Item,
          {
            label: "GitHub Token",
            name: "token",
            rules: [{ required: true, message: "Please input your password!" }],
            children: /* @__PURE__ */ jsx(Input.Password, {})
          }
        ),
        error && !isLoading && /* @__PURE__ */ jsx(Alert, { message: error, type: "error", showIcon: true, style: { marginBottom: 16 } }),
        /* @__PURE__ */ jsx(Form.Item, { label: null, children: /* @__PURE__ */ jsx(
          Button,
          {
            type: "primary",
            htmlType: "submit",
            disabled: isLoading,
            loading: isLoading,
            children: "OK"
          }
        ) })
      ]
    }
  ) });
}
const login = withComponentProps(function Login() {
  return /* @__PURE__ */ jsx(LoginPage, {});
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: login
}, Symbol.toStringTag, { value: "Module" }));
function UpdateRepo({ login: login2, token, repoName, initialDescription, initialVisibility }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await dispatch(updateRepository({ login: login2, token, repoName, data: { description: values.description, private: values.visibility === "private" } }));
      message.success(`Репозиторий "${repoName}" обновлен!`);
      setIsModalOpen(false);
    } catch (error) {
      message.error("Ошибка при обновлении репозитория");
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Button, { type: "link", onClick: showModal, children: "Обновить" }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        title: `Обновить репозиторий: ${repoName}`,
        open: isModalOpen,
        onCancel: handleCancel,
        onOk: handleUpdate,
        okText: "Обновить",
        cancelText: "Отмена",
        children: /* @__PURE__ */ jsxs(Form, { form, layout: "vertical", initialValues: { description: initialDescription, visibility: initialVisibility }, children: [
          /* @__PURE__ */ jsx(Form.Item, { label: "Описание", name: "description", children: /* @__PURE__ */ jsx(Input.TextArea, { placeholder: "Введите новое описание" }) }),
          /* @__PURE__ */ jsx(Form.Item, { label: "Видимость", name: "visibility", children: /* @__PURE__ */ jsxs(Select, { children: [
            /* @__PURE__ */ jsx(Select.Option, { value: "public", children: "Публичный" }),
            /* @__PURE__ */ jsx(Select.Option, { value: "private", children: "Приватный" })
          ] }) })
        ] })
      }
    )
  ] });
}
function DeleteRepoButton({ login: login2, token, repoName }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);
  const handleDelete = async () => {
    try {
      await dispatch(deleteRepository({ login: login2, token, repoName }));
      message.success(`Репозиторий "${repoName}" удален.`);
      setIsModalOpen(false);
    } catch (error) {
      message.error("Ошибка при удалении репозитория.");
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Button, { type: "link", danger: true, onClick: showModal, children: "Удалить" }),
    /* @__PURE__ */ jsxs(
      Modal,
      {
        title: "Подтверждение удаления",
        open: isModalOpen,
        onCancel: handleCancel,
        onOk: handleDelete,
        okText: "Да, удалить",
        okType: "danger",
        cancelText: "Отмена",
        children: [
          /* @__PURE__ */ jsxs("p", { children: [
            'Вы уверены, что хотите удалить репозиторий "',
            /* @__PURE__ */ jsx("strong", { children: repoName }),
            '"?'
          ] }),
          /* @__PURE__ */ jsx("p", { children: "Это действие нельзя отменить." })
        ]
      }
    )
  ] });
}
function RepoDetailsModal({
  login: login2,
  token,
  repoName
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const { data, status, error } = useSelector(
    (state) => state.repos.selectedRepo
  );
  const showModal = async () => {
    setIsModalOpen(true);
    try {
      await dispatch(fetchRepositoryDetails({ login: login2, token, repoName }));
    } catch {
      message.error("Ошибка при загрузке репозитория");
    }
  };
  const handleCancel = () => setIsModalOpen(false);
  const isLoading = status === "loading";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Button, { type: "link", onClick: showModal, children: "Детали" }),
    /* @__PURE__ */ jsxs(
      Modal,
      {
        title: `Детали репозитория: ${repoName}`,
        open: isModalOpen,
        onCancel: handleCancel,
        footer: null,
        children: [
          isLoading && /* @__PURE__ */ jsx("p", { className: "repo-detail-spinner", children: /* @__PURE__ */ jsx(Spin, { tip: "Загрузка..." }) }),
          data && !isLoading && /* @__PURE__ */ jsxs(Descriptions, { column: 1, bordered: true, children: [
            /* @__PURE__ */ jsx(Descriptions.Item, { label: "Название", children: data.name }),
            /* @__PURE__ */ jsx(Descriptions.Item, { label: "Описание", children: data.description || "Нет описания" }),
            /* @__PURE__ */ jsx(Descriptions.Item, { label: "Звезды", children: data.stargazers_count }),
            /* @__PURE__ */ jsx(Descriptions.Item, { label: "Форки", children: data.forks_count }),
            /* @__PURE__ */ jsx(Descriptions.Item, { label: "Приватный", children: data.private ? "✅ Да" : "❌ Нет" }),
            /* @__PURE__ */ jsx(Descriptions.Item, { label: "Видимость", children: data.visibility }),
            /* @__PURE__ */ jsx(Descriptions.Item, { label: "Язык", children: data.language || "Не указан" }),
            /* @__PURE__ */ jsx(Descriptions.Item, { label: "Дата создания", children: new Date(data.created_at).toLocaleString() }),
            /* @__PURE__ */ jsx(Descriptions.Item, { label: "Последнее обновление", children: new Date(data.updated_at).toLocaleString() })
          ] }),
          error && /* @__PURE__ */ jsx("p", { children: "error" })
        ]
      }
    )
  ] });
}
function RepoTable({ login: login2, token }) {
  const dispatch = useDispatch();
  const { repositories, status, error } = useSelector(
    (state) => state.repos
  );
  useEffect(() => {
    if (!login2 || !token) return;
    dispatch(fetchRepositories({ login: login2, token }));
  }, [dispatch, login2, token]);
  const columns = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Описание",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "Нет описания"
    },
    {
      title: "Видимость",
      dataIndex: "visibility",
      key: "visibility",
      render: (visibility) => visibility === "public" ? "✅ Да" : "❌ Нет"
    },
    {
      title: "Действия",
      key: "action",
      render: (_, record) => {
        return /* @__PURE__ */ jsxs(Space, { children: [
          login2 && token && /* @__PURE__ */ jsx(
            UpdateRepo,
            {
              login: login2,
              token,
              repoName: record.name,
              initialVisibility: record.visibility
            }
          ),
          login2 && token && /* @__PURE__ */ jsx(
            DeleteRepoButton,
            {
              login: login2,
              token,
              repoName: record.name
            }
          ),
          login2 && token && /* @__PURE__ */ jsx(
            RepoDetailsModal,
            {
              login: login2,
              token,
              repoName: record.name
            }
          )
        ] });
      }
    }
  ];
  console.log(repositories);
  if (status === "loading") return /* @__PURE__ */ jsx("p", { children: "Загрузка..." });
  if (error) return /* @__PURE__ */ jsxs("p", { children: [
    "Ошибка: ",
    error
  ] });
  return /* @__PURE__ */ jsx(Table, { columns, dataSource: repositories, rowKey: "id" });
}
function CreateRepoButton({ login: login2, token }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await dispatch(createRepository({ login: login2, token, ...values }));
      message.success(`Репозиторий "${values.name}" создан!`);
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error("Ошибка при создании репозитория");
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Button, { type: "primary", onClick: showModal, children: "Создать репозиторий" }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        title: "Создать новый репозиторий",
        open: isModalOpen,
        onCancel: handleCancel,
        onOk: handleCreate,
        okText: "Создать",
        cancelText: "Отмена",
        children: /* @__PURE__ */ jsxs(Form, { form, layout: "vertical", children: [
          /* @__PURE__ */ jsx(
            Form.Item,
            {
              label: "Название",
              name: "name",
              rules: [{ required: true, message: "Введите название репозитория!" }],
              children: /* @__PURE__ */ jsx(Input, {})
            }
          ),
          /* @__PURE__ */ jsx(Form.Item, { label: "Описание", name: "description", children: /* @__PURE__ */ jsx(Input.TextArea, {}) }),
          /* @__PURE__ */ jsx(
            Form.Item,
            {
              label: "Видимость",
              name: "visibility",
              initialValue: "public",
              rules: [{ required: true, message: "Выберите видимость!" }],
              children: /* @__PURE__ */ jsxs(Select, { children: [
                /* @__PURE__ */ jsx(Select.Option, { value: "public", children: "Публичный" }),
                /* @__PURE__ */ jsx(Select.Option, { value: "private", children: "Приватный" })
              ] })
            }
          )
        ] })
      }
    )
  ] });
}
const { Header, Content } = Layout$1;
function ReposPage() {
  let navigate = useNavigate();
  const { user, token } = useSelector((state) => state.user);
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token]);
  return /* @__PURE__ */ jsx("main", { className: "repos-container", children: /* @__PURE__ */ jsxs(Layout$1, { children: [
    /* @__PURE__ */ jsxs(Header, { className: "header", children: [
      /* @__PURE__ */ jsx(CreateRepoButton, { login: user == null ? void 0 : user.login, token }),
      /* @__PURE__ */ jsxs("div", { className: "logo", children: [
        /* @__PURE__ */ jsx("div", { className: "username", children: (user == null ? void 0 : user.login) || "" }),
        /* @__PURE__ */ jsx(Avatar, { src: user == null ? void 0 : user.avatar_url })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Content, { className: "content", children: /* @__PURE__ */ jsx(RepoTable, { login: user == null ? void 0 : user.login, token }) })
  ] }) });
}
const repos = withComponentProps(function Repos() {
  return /* @__PURE__ */ jsx(ReposPage, {});
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: repos
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/git-test-dm/assets/entry.client-twZutndp.js", "imports": ["/git-test-dm/assets/chunk-K6CSEXPM-4mSyEK9p.js", "/git-test-dm/assets/index-DfuGBccL.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/git-test-dm/assets/root-By7C6zCD.js", "imports": ["/git-test-dm/assets/chunk-K6CSEXPM-4mSyEK9p.js", "/git-test-dm/assets/index-DfuGBccL.js", "/git-test-dm/assets/index-DTAP5zJS.js", "/git-test-dm/assets/repos-4xT3LU5-.js", "/git-test-dm/assets/user-BIhsPN22.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/login": { "id": "routes/login", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/git-test-dm/assets/login-H5pakGVT.js", "imports": ["/git-test-dm/assets/index-DTAP5zJS.js", "/git-test-dm/assets/chunk-K6CSEXPM-4mSyEK9p.js", "/git-test-dm/assets/user-BIhsPN22.js", "/git-test-dm/assets/index-CceGS_MW.js", "/git-test-dm/assets/index-DfuGBccL.js"], "css": ["/git-test-dm/assets/login-CCc5V1-n.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/repos": { "id": "routes/repos", "parentId": "root", "path": "repos", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/git-test-dm/assets/repos-C3FFicrd.js", "imports": ["/git-test-dm/assets/index-DTAP5zJS.js", "/git-test-dm/assets/chunk-K6CSEXPM-4mSyEK9p.js", "/git-test-dm/assets/repos-4xT3LU5-.js", "/git-test-dm/assets/index-CceGS_MW.js", "/git-test-dm/assets/index-DfuGBccL.js"], "css": ["/git-test-dm/assets/repos-DlzZDt19.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/git-test-dm/assets/manifest-1df2948e.js", "version": "1df2948e" };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const publicPath = "/git-test-dm/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/repos": {
    id: "routes/repos",
    parentId: "root",
    path: "repos",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routes,
  ssr
};
