// This component is used to add a room to the marketplace and show the user's cEUR balance

// Importing the dependencies
import { useState } from "react";
// import ethers to convert the room price to wei
import { ethers } from "ethers";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import the useDebounce hook to debounce the input fields
import { useDebounce } from "use-debounce";
// Import our custom useContractSend hook to write a room to the marketplace contract
import { useContractSend } from "@/hooks/contract/useContractWrite";

// The AddRoomModal component is used to add a room to the marketplace
const AddRoomModal = () => {
  // The visible state is used to toggle the modal
  const [visible, setVisible] = useState(false);
  // The following states are used to store the values of the form fields
  const [roomName, setRoomName] = useState("");
  const [roomPrice, setRoomPrice] = useState<string | number>(0);
  const [roomImage, setRoomImage] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomLocation, setRoomLocation] = useState("");
  // The following states are used to store the debounced values of the form fields
  const [debouncedRoomName] = useDebounce(roomName, 500);
  const [debouncedRoomPrice] = useDebounce(roomPrice, 500);
  const [debouncedRoomImage] = useDebounce(roomImage, 500);
  const [debouncedRoomDescription] = useDebounce(roomDescription, 500);
  const [debouncedRoomLocation] = useDebounce(roomLocation, 500);
  // The loading state is used to display a loading message
  const [loading, setLoading] = useState("");

  // Check if all the input fields are filled
  const isComplete =
    roomName &&
    roomPrice &&
    roomImage &&
    roomLocation &&
    roomDescription;

  // Clear the input fields after the room is added to the marketplace
  const clearForm = () => {
    setRoomName("");
    setRoomPrice(0);
    setRoomImage("");
    setRoomDescription("");
    setRoomLocation("");
  };

  // Convert the room price to wei
  const roomPriceInWei = ethers.utils.parseEther(
    debouncedRoomPrice.toString() || "0"
  );

  // Use the useContractSend hook to use our writeRoom function on the marketplace contract and add a room to the marketplace
  const { writeAsync: createRoom } = useContractSend("writeroom", [
    debouncedRoomName,
    debouncedRoomImage,
    debouncedRoomDescription,
    debouncedRoomLocation,
    roomPriceInWei,
  ]);

  // Define function that handles the creation of a room through the marketplace contract
  const handleCreateRoom = async () => {
    if (!createRoom) {
      throw "Failed to create room";
    }
    setLoading("Creating...");
    if (!isComplete) throw new Error("Please fill all fields");
    // Create the room by calling the writeRoom function on the marketplace contract
    console.log(roomPriceInWei);

    const purchaseTx = await createRoom();
    setLoading("Waiting for confirmation...");
    // Wait for the transaction to be mined
    await purchaseTx.wait();
    // Close the modal and clear the input fields after the room is added to the marketplace
    setVisible(false);
    clearForm();
  };

  // Define function that handles the creation of a room, if a user submits the room form
  const addRoom = async (e: any) => {
    e.preventDefault();

    try {
      // Display a notification while the room is being added to the marketplace
      await toast.promise(handleCreateRoom(), {
        pending: "Creating room...",
        success: "Room created successfully",
        error: "Something went wrong. Try again.",
      });
      // Display an error message if something goes wrong
    } catch (e: any) {
      console.log({ e });
      toast.error(e?.message || "Something went wrong. Try again.");
      // Clear the loading state after the room is added to the marketplace
    } finally {
      setLoading("");
    }
  };

  // Define the JSX that will be rendered
  return (
    <div className={"flex flex-row w-full justify-between"}>
      <div>
        {/* Add Room Button that opens the modal */}
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="inline-block px-6 py-2.5 bg-green-500 text-black font-medium text-md leading-tight hover:bg-green-700 hover:shadow-lg focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green-800 active:shadow-lg transition duration-150 ease-in-out"
          data-bs-toggle="modal"
          data-bs-target="#exampleModalCenter">
          Add Room
        </button>

        {/* Modal */}
        {visible && (
          <div
            className="fixed z-40 overflow-y-auto top-0 w-full left-0"
            id="modal">
            {/* Form with input fields for the Room, that triggers the addRoom function on submit */}
            <form onSubmit={addRoom}>
              <div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity">
                  <div className="absolute inset-0 bg-gray-900 opacity-75" />
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
                  &#8203;
                </span>
                <div
                  className="inline-block align-center bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="modal-headline">
                  {/* Input fields for the room */}
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <label>Room Name</label>
                    <input
                      onChange={(e) => {
                        setRoomName(e.target.value);
                      }}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Room Image (URL)</label>
                    <input
                      onChange={(e) => {
                        setRoomImage(e.target.value);
                      }}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Room Description</label>
                    <input
                      onChange={(e) => {
                        setRoomDescription(e.target.value);
                      }}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Room Location</label>
                    <input
                      onChange={(e) => {
                        setRoomLocation(e.target.value);
                      }}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Room Price (cEUR)</label>
                    <input
                      onChange={(e) => {
                        setRoomPrice(e.target.value);
                      }}
                      required
                      type="number"
                      step="any"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />
                  </div>
                  {/* Button to close the modal */}
                  <div className="bg-gray-200 px-4 py-3 text-right">
                    <button
                      type="button"
                      className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                      onClick={() => setVisible(false)}>
                      <i className="fas fa-times"></i> Cancel
                    </button>
                    {/* Button to add the room to the marketplace */}
                    <button
                      type="submit"
                      disabled={!!loading || !isComplete || !createRoom}
                      className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2">
                      {loading ? loading : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddRoomModal;
