import { useState } from "react";
import { Modal, Button, message } from "antd";
import { useDispatch } from "react-redux";
import { deleteRepository } from "../../store/repos";

interface DeleteRepoModalProps {
  login: string;
  token: string;
  repoName: string;
}

export function DeleteRepoButton({ login, token, repoName }: DeleteRepoModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const handleDelete = async () => {
    try {
      await dispatch(deleteRepository({ login, token, repoName }) as any);
      message.success(`Репозиторий "${repoName}" удален.`);
      setIsModalOpen(false);
    } catch (error) {
      message.error("Ошибка при удалении репозитория.");
    }
  };

  return (
    <>
      <Button type="link" danger onClick={showModal}>
        Удалить
      </Button>

      <Modal
        title="Подтверждение удаления"
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleDelete}
        okText="Да, удалить"
        okType="danger"
        cancelText="Отмена"
      >
        <p>Вы уверены, что хотите удалить репозиторий "<strong>{repoName}</strong>"?</p>
        <p>Это действие нельзя отменить.</p>
      </Modal>
    </>
  );
}
