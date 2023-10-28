import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Notification } from "../Notifications"; // Import your Notification component

function CustomToastContainer() {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type) => {
    const newNotification = {
      message,
      type,
      id: Date.now(),
    };
    setNotifications([...notifications, newNotification]);
  };

  const removeNotification = (id) => {
    const updatedNotifications = notifications.filter((notification) => notification.id !== id);
    setNotifications(updatedNotifications);
  };

  return (
    <div>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

const CustomToast = {
  success: (message) => CustomToastContainer().showNotification(message, "success"),
  error: (message) => CustomToastContainer().showNotification(message, "error"),
  info: (message) => CustomToastContainer().showNotification(message, "info"),
  warning: (message) => CustomToastContainer().showNotification(message, "warning"),
};

export default CustomToast;
export { CustomToastContainer };
