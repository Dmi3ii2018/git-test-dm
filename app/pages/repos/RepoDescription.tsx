import { useState } from "react";
import { Modal, Button, Descriptions, Spin, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchRepositoryDetails } from "../../store/repos";

interface RepoDetailsModalProps {
  login: string;
  token: string;
  repoName: string;
}

export function RepoDetailsModal({
  login,
  token,
  repoName,
}: RepoDetailsModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const {data, status, error} = useSelector(
    (state: any) => state.repos.selectedRepo
  );

  const showModal = async () => {
    setIsModalOpen(true);
    try {
      await dispatch(fetchRepositoryDetails({ login, token, repoName }) as any);
    } catch {
      message.error("Ошибка при загрузке репозитория");
    }
  };
  const handleCancel = () => setIsModalOpen(false);

const isLoading = status === 'loading' 

  return (
    <>
      <Button type="link" onClick={showModal}>
        Детали
      </Button>

      <Modal
        title={`Детали репозитория: ${repoName}`}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        {isLoading && (
          <p className="repo-detail-spinner"><Spin tip="Загрузка..." /></p>
        )}
        {data && !isLoading && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Название">
              {data.name}
            </Descriptions.Item>
            <Descriptions.Item label="Описание">
              {data.description || "Нет описания"}
            </Descriptions.Item>
            <Descriptions.Item label="Звезды">
              {data.stargazers_count}
            </Descriptions.Item>
            <Descriptions.Item label="Форки">
              {data.forks_count}
            </Descriptions.Item>
            <Descriptions.Item label="Приватный">
              {data.private ? "✅ Да" : "❌ Нет"}
            </Descriptions.Item>
            <Descriptions.Item label="Видимость">
              {data.visibility}
            </Descriptions.Item>
            <Descriptions.Item label="Язык">
              {data.language || "Не указан"}
            </Descriptions.Item>
            <Descriptions.Item label="Дата создания">
              {new Date(data.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Последнее обновление">
              {new Date(data.updated_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
        {error && <p>error</p>}
      </Modal>
    </>
  );
}
