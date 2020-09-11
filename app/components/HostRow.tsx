import React, { useState, useEffect, useContext } from 'react';
import { Host } from '../types';
import { HostsContext } from '../context/HostsContext';
// Material General
import { makeStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import DeleteIcon from '@material-ui/icons/Delete';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
// Material Dialog
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import DialogTitle from '@material-ui/core/DialogTitle';
import { TransitionProps } from '@material-ui/core/transitions/transition';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';


const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles({
    root: {
        paddingTop: '1rem',
        paddingBottom: '1rem',
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
        margin: '0.5rem',
        display: 'flex'
    },
    deleteButton: {
        marginRight: '5px'
    },
});


function HostRow(props:Host) {
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
    const [hosts, setHosts] = useContext(HostsContext);
    const classes = useStyles();

    const getThisHost = () => {
        let hostsCopy = [...hosts];
        let thisHost = hostsCopy.find(el => el.id === props.id);
        return [thisHost, hostsCopy];
    }

    const handleClickToggleIsEnabled = () => {
        let [thisHost, hostsCopy] = getThisHost();
        thisHost.isEnabled = !thisHost.isEnabled;
        setHosts(hostsCopy);
    }

    const handleClickDelete = () => {
        if (props.name.trim() === '') {
            deleteHost();
        } else {
            setDeleteModalIsOpen(true)
        }
    }

    const handleUpdateName = (event) => {
        let [thisHost, hostsCopy] = getThisHost();
        thisHost.name = event.target.value;
        setHosts(hostsCopy);
    }

    const deleteHost = () => {
        let [thisHost, hostsCopy] = getThisHost();
        hostsCopy = hostsCopy.filter(el => el !== thisHost);
        setHosts(hostsCopy);
        setDeleteModalIsOpen(false);
    }

    const handleBlur = () => {
        // if its their first time entering a host enable it once they're done editing the hostname
        if (!props.isBrandNew) return;

        let [thisHost, hostsCopy] = getThisHost();
        if (thisHost.name.trim() !== '') {
            thisHost.isEnabled = true;
            thisHost.isBrandNew = false;
            setHosts(hostsCopy);
        }
    }

    return (
        <Card className={classes.root}>
                <IconButton onClick={handleClickDelete} className={classes.deleteButton} color="primary" aria-label="upload picture" component="span">
                    <DeleteIcon />
                </IconButton>
                <Input value={props.name} placeholder="Host" fullWidth onChange={event => handleUpdateName(event)} onBlur={handleBlur} />
                <Checkbox checked={props.isEnabled} onChange={handleClickToggleIsEnabled} color="primary" />

                <Dialog open={deleteModalIsOpen} onClose={() => setDeleteModalIsOpen(false)} TransitionComponent={Transition}>
                    <DialogTitle id="alert-dialog-slide-title">Delete Host</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            Are you sure you want to delete host {props.name}?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteModalIsOpen(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={deleteHost} color="primary">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
        </Card>
    );
}

export default HostRow;