import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../components/Icon";
import { fetchStudentCases } from "../lib/api";

function StudentOrderEntryPage({ onNavigate }) {
  const [searchParams] = useSearchParams();

  const [patientCase, setPatientCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [orderType, setOrderType] = useState("Lab");
  const [orderName, setOrderName] = useState("");
  const [orders, setOrders] = useState([]);

  const caseId = searchParams.get("id");

  useEffect(() => {
    let isCurrent = true;

    async function loadCase() {
      if (!caseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const cases = await fetchStudentCases();

        if (!isCurrent) return;

        const selectedCase = cases.find(
          (currentCase) =>
            String(currentCase.id) === String(caseId),
        );

        setPatientCase(selectedCase ?? null);
      } catch (loadError) {
        if (isCurrent) {
          setError(loadError.message);
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    loadCase();

    return () => {
      isCurrent = false;
    };
  }, [caseId]);

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

    setOrders((currentOrders) => [
      ...currentOrders,
      newOrder,
    ]);

    setOrderName("");
  }

  function handleRemoveOrder(orderId) {
    setOrders((currentOrders) =>
      currentOrders.filter(
        (order) => order.id !== orderId,
      ),
    );
  }

  function handleSaveOrders() {
    console.log("Orders saved:", {
      caseId: patientCase.id,
      orders,
    });

    alert("Orders saved locally for now.");
  }

  function goBackToCase() {
    onNavigate("caseDetail", {
      caseId: patientCase.id,
    });
  }

  if (loading) {
    return (
      <div className="dashboard-page content-page">
        <p role="status">Loading case...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page content-page">
        <p role="alert">{error}</p>
      </div>
    );
  }

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

  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">
            Mock Orders · {patientCase.id}
          </p>

          <h1>{patientCase.patient_name}</h1>

          <p>
            {patientCase.chief_complaint}
          </p>
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={goBackToCase}
        >
          <Icon name="arrow" size={16} />
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
              <option value="Lab">Lab</option>
              <option value="Imaging">Imaging</option>
              <option value="Medication">Medication</option>
              <option value="Referral">Referral</option>
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
                    <th aria-label="Actions" />
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
            onClick={goBackToCase}
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