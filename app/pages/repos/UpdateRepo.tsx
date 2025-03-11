import { useState } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { useDispatch } from "react-redux";
import { updateRepository } from "../../store/repos";

interface UpdateRepoModalProps {
  login: string;
  token: string;
  repoName: string;
  initialDescription?: string;
  initialVisibility: "public" | "private";
}

export function UpdateRepo({ login, token, repoName, initialDescription, initialVisibility }: UpdateRepoModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await dispatch(updateRepository({ login, token, repoName, data: { description: values.description, private: values.visibility === "private" } }) as any);
      message.success(`Репозиторий "${repoName}" обновлен!`);
      setIsModalOpen(false);
    } catch (error) {
      message.error("Ошибка при обновлении репозитория");
    }
  };

  return (
    <>
      <Button type="link" onClick={showModal}>Обновить</Button>

      <Modal
        title={`Обновить репозиторий: ${repoName}`}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleUpdate}
        okText="Обновить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" initialValues={{ description: initialDescription, visibility: initialVisibility }}>
          <Form.Item label="Описание" name="description">
            <Input.TextArea placeholder="Введите новое описание" />
          </Form.Item>

          <Form.Item label="Видимость" name="visibility">
            <Select>
              <Select.Option value="public">Публичный</Select.Option>
              <Select.Option value="private">Приватный</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
