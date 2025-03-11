import { useEffect } from "react";
import { Table, Button, Space, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchRepositories, updateRepository, deleteRepository } from "../../store/repos";

import type { RootState } from "../../store/store";

interface RepoTableProps {
  login?: string;
  token?: string | null;
}

export function RepoTable({ login, token }: RepoTableProps) {
  const dispatch = useDispatch();
  const { repositories, status, error } = useSelector((state: RootState) => state.repos);

  useEffect(() => {
    if (!login || !token) return;
    dispatch(fetchRepositories({ login, token }) as any);
  }, [dispatch, login, token]);

  const handleUpdate = (repoName: string) => {
    if (!login || !token) return;
    dispatch(updateRepository({ login, token, repoName, data: { description: "Обновленное описание" } }) as any)
      .then(() => message.success(`Репозиторий ${repoName} обновлен`))
      .catch(() => message.error(`Ошибка обновления ${repoName}`));
  };

  const handleDelete = (repoName: string) => {
    if (!login || !token) return;
    dispatch(deleteRepository({ login, token, repoName }) as any)
      .then(() => message.success(`Репозиторий ${repoName} удален`))
      .catch(() => message.error(`Ошибка удаления ${repoName}`));
  };

  const columns = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Описание",
      dataIndex: "description",
      key: "description",
      render: (text: string | null) => text || "Нет описания",
    },
    {
      title: "Видимость",
      dataIndex: "visibility",
      key: "visibility",
      render: (visibility: string) => (visibility === 'public' ? "✅ Да" : "❌ Нет"),
    },
    {
      title: "Действия",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" onClick={() => handleUpdate(record.name)}>
            Обновить
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.name)}>
            Удалить
          </Button>
        </Space>
      ),
    },
  ];
console.log('repositories', repositories)
  if (status === "loading") return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;

  return <Table columns={columns} dataSource={repositories} rowKey="id" />;
}
