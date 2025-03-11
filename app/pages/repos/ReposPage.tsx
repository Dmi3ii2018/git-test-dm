import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import { Avatar, Layout, Table } from 'antd';

import type { RootState } from "../../store/store";

import './style.css';


const { Header, Content } = Layout;

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

export function ReposPage() {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const {user, token} = useSelector((state: RootState) => state.user);

  console.log(token)
  
  if (!token) {
    navigate('/')
  }

  useEffect(() => {
    if (!token) return;


  }, [token])

  return (
    <main className="repos-container">
      <Layout>
        <Header className="header">
          <p className="username">{user?.login || ''}</p>
          <Avatar src={user?.avatar_url} />
        </Header>
        <Content className="content">
        <Table<DataType> columns={columns} dataSource={data} />
        </Content>
      </Layout>
    </main>
  );
}
