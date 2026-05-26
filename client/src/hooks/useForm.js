import { useState } from "react";

/**
 * Generic form state management hook.
 * @param {Object} initialValues - Initial form field values
 */
const useForm = (initialValues) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return { values, setValues, errors, setErrors, handleChange, reset };
};

export default useForm;
