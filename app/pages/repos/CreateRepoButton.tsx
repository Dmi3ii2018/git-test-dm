import { useState } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { useDispatch } from "react-redux";
import { createRepository } from "../../store/repos";

interface CreateRepoButtonProps {
  login?: string;
  token?: string | null;
}

export function CreateRepoButton({ login, token }: CreateRepoButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await dispatch(createRepository({ login, token, ...values }) as any);
      message.success(`Репозиторий "${values.name}" создан!`);
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error("Ошибка при создании репозитория");
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>Создать репозиторий</Button>

      <Modal
        title="Создать новый репозиторий"
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleCreate}
        okText="Создать"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Название"
            name="name"
            rules={[{ required: true, message: "Введите название репозитория!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Описание" name="description">
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            label="Видимость"
            name="visibility"
            initialValue="public"
            rules={[{ required: true, message: "Выберите видимость!" }]}
          >
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
