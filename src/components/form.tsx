import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Modal from "./ui/modal";
import Input from "./ui/input";
import Textarea from "./ui/textarea";
import Select, { type Option } from "./ui/select";
import Button, { type ButtonVariant } from "./ui/button";
import ComboBoxInput from "./ui/combobox";

type BaseFieldConfig = {
  key: string;
  label: string;
  colSpan?: 1 | 2;
};

type InputFieldType = BaseFieldConfig & {
  type: "text" | "number" | "date" | "time";
  placeholder?: string;
};

type TextareaFieldType = BaseFieldConfig & {
  type: "textarea";
  placeholder?: string;
};

type SelectFieldType = BaseFieldConfig & {
  type: "select";
  options: Option[];
};

type ToggleFieldType = BaseFieldConfig & {
  type: "toggle";
  activeText?: string;
  inactiveText?: string;
};

type ComboBoxFieldType = BaseFieldConfig & {
  type: "combobox";
  options: string[];
  placeholder?: string;
};

type FormFieldConfig =
  | InputFieldType
  | TextareaFieldType
  | SelectFieldType
  | ToggleFieldType
  | ComboBoxFieldType;

type GenericFormModalProps<T extends object> = {
  config: FormFieldConfig[];
  title: string;
  initialData: T;
  editingData?: T;
  errors?: Partial<Record<keyof T, string>>;
  onSubmit: (data: T) => Promise<boolean | void>;
  onDraft?: (data: T) => Promise<boolean | void>;
  submitLabel?: string;
  triggerLabel?: string;
  onClose?: () => void;
  onChange?: (data: T) => void;
};

const GenericFormModal = <T extends object>({
  title,
  initialData,
  editingData,
  errors,
  onSubmit,
  submitLabel = "Save",
  triggerLabel = "Add",
  config,
  onClose,
  onChange,
  onDraft,
}: GenericFormModalProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);

  const updateField = <K extends keyof T>(key: K, value: T[K]) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
    onChange?.({ ...formState, [key]: value });
  };

  const handleClose = () => {
    setFormState(initialData);
    setIsOpen(false);
    onClose?.();
  };

  const handleSumbit = async () => {
    setLoading(true);
    const success = await onSubmit(formState);
    if (success !== false) setIsOpen(false);
    setLoading(false);
  };

  const handleDraft = async () => {
    setLoading(true);
    const success = await onDraft?.(formState);
    if (success !== false) setIsOpen(false);
    setLoading(false);
  };

  useEffect(() => {
    if (editingData) {
      setFormState(editingData);
      setIsOpen(true);
    }
  }, [editingData]);
  return (
    <>
      <Button
        leftIcon={<Plus size={18} />}
        onClick={() => {
          setFormState(initialData);
          setIsOpen(true);
        }}
      >
        {triggerLabel}
      </Button>
      <Modal
        open={isOpen}
        onClose={handleClose}
        title={title}
        actions={[
          {
            label: "Cancel",
            onClick: handleClose,
            variant: "outline" as ButtonVariant,
          },
          ...(onDraft
            ? [
                {
                  label: "Save as Draft",
                  variant: "secondary" as ButtonVariant,
                  onClick: handleDraft,
                },
              ]
            : []),
          {
            label: submitLabel,
            onClick: handleSumbit,
            loading: loading,
          },
        ]}
      >
        <div className="grid grid-cols-2 gap-4">
          {config.map((field) => {
            const value = formState[field.key as keyof T];
            const error = errors?.[field.key as keyof T];
            const colSpan = field.colSpan === 2 ? "col-span-2" : "col-span-1";
            switch (field.type) {
              case "textarea":
                return (
                  <div key={field.key} className="col-span-2">
                    <Textarea
                      label={field.label}
                      value={String(value || "")}
                      placeholder={field.placeholder}
                      error={error}
                      onChange={(value) =>
                        updateField(field.key as keyof T, value as T[keyof T])
                      }
                    />
                  </div>
                );
              case "select":
                return (
                  <div key={field.key} className={colSpan}>
                    <Select
                      label={field.label}
                      value={String(value || "")}
                      options={field.options}
                      onChange={(value) =>
                        updateField(field.key as keyof T, value as T[keyof T])
                      }
                    />
                  </div>
                );
              case "toggle":
                return (
                  <div key={field.key} className={colSpan}>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          field.key as keyof T,
                          !(value as boolean) as T[keyof T],
                        )
                      }
                      className={`flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold transition-all hover:cursor-pointer ${
                        value
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {value
                        ? field.activeText || "Enabled"
                        : field.inactiveText || "Disabled"}
                    </button>
                  </div>
                );
              case "combobox":
                return (
                  <div key={field.key} className={colSpan}>
                    <ComboBoxInput
                      label={field.label}
                      value={String(value || "")}
                      placeholder={field.placeholder}
                      options={field.options}
                      error={error}
                      onChange={(val) =>
                        updateField(field.key as keyof T, val as T[keyof T])
                      }
                    />
                  </div>
                );
              default:
                return (
                  <div key={field.key} className={colSpan}>
                    <Input
                      label={field.label}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={value as string | number}
                      error={error}
                      onChange={(value) =>
                        updateField(
                          field.key as keyof T,
                          field.type === "number"
                            ? (Number(value) as T[keyof T])
                            : (value as T[keyof T]),
                        )
                      }
                    />
                  </div>
                );
            }
          })}
        </div>
      </Modal>
    </>
  );
};

export default GenericFormModal;
export type { FormFieldConfig };
