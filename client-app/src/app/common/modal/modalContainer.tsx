import { observer } from "mobx-react-lite";
import React from "react";
import { Modal } from "semantic-ui-react";
import { useStore } from "../../store/Store";

export default observer (function ModalContainer(){
    const {modalStore}=useStore();

    return (
        <Modal open={modalStore.model.open} onClose={modalStore.closeModel} size='mini'>
            <Modal.Content>
                {modalStore.model.body}
            </Modal.Content>
        </Modal>
    )
})