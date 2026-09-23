import { useState } from "react";

function StudentOrderEntryPage({
  user,
  selectedCaseId,
  onNavigate,
  studentCases,
  studentOrders,
  saveStudentOrders,
}) {
  const cases = studentCases[user.id] || [];

  const patientCase = cases.find(
    (c) => c.id === selectedCaseId
  );

  const existingOrders =
    studentOrders[selectedCaseId] || [];

  const [orderType, setOrderType] = useState("Lab");
  const [orderName, setOrderName] = useState("");
  const [orders, setOrders] = useState(existingOrders);

  if (!patientCase) {
    return (
      <div className="dashboard-page content-page">
        <p>No case selected.</p>

        <button
          className="secondary-button"
          type="button"
          onClick={() => onNavigate("overview")}
        >
          Back to my cases
        </button>
      </div>
    );
  }

  function handleAddOrder() {
    if (!orderName.trim()) {
      return;
    }

    const newOrder = {
      id: Date.now(),
      type: orderType,
      name: orderName.trim(),
      status: "Draft",
    };

    setOrders((previousOrders) => [
      ...previousOrders,
      newOrder,
    ]);

    setOrderName("");
  }

  function handleRemoveOrder(orderId) {
    setOrders((previousOrders) =>
      previousOrders.filter(
        (order) => order.id !== orderId
      )
    );
  }

  function handleSaveOrders() {
    saveStudentOrders(
      patientCase.id,
      orders
    );

    onNavigate("caseDetail");
  }

  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">
            Mock Orders · {patientCase.id}
          </p>

          <h1>{patientCase.patientName}</h1>

          <p>{patientCase.chiefComplaint}</p>
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={() => onNavigate("caseDetail")}
        >
          Back to case
        </button>
      </section>

      <section className="panel data-panel">
        <div className="order-form">
          <div className="order-field">
            <label htmlFor="orderType">
              Order Type
            </label>

            <select
              id="orderType"
              value={orderType}
              onChange={(event) =>
                setOrderType(event.target.value)
              }
            >
              <option value="Lab">
                Lab
              </option>

              <option value="Imaging">
                Imaging
              </option>

              <option value="Medication">
                Medication
              </option>

              <option value="Referral">
                Referral
              </option>
            </select>
          </div>

          <div className="order-field">
            <label htmlFor="orderName">
              Description
            </label>

            <textarea
              id="orderName"
              value={orderName}
              onChange={(event) =>
                setOrderName(event.target.value)
              }
              placeholder="Enter order..."
              rows="4"
            />
          </div>
          <button
            className="primary-button add-order-button"
            type="button"
            onClick={handleAddOrder}
          >
            Add Order
          </button>
        </div>

        <div className="orders-list">
          <h2>Draft Orders</h2>

          {orders.length === 0 ? (
            <p>No orders added yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.type}</td>

                      <td>{order.name}</td>

                      <td>
                        <span className="status-badge">
                          {order.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="secondary-button"
                          type="button"
                          onClick={() =>
                            handleRemoveOrder(order.id)
                          }
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() => onNavigate("caseDetail")}
          >
            Cancel
          </button>

          <button
            className="primary-button"
            type="button"
            onClick={handleSaveOrders}
          >
            Save Orders
          </button>
        </div>
      </section>
    </div>
  );
}

export default StudentOrderEntryPage;