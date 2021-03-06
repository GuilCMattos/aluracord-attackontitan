import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React, { useState } from 'react';
import appConfig from '../config.json';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js'
import {ButtonSendSticker} from '../src/components/buttonSendSticker';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzI5MjQ2OSwiZXhwIjoxOTU4ODY4NDY5fQ.1ZjQTeXkcn9ZfKebmPeWWKzSu8GfMuXn6_NkC7ff94Y';
const SUPABASE_URL = 'https://pajcfjtrtiykncznswye.supabase.co';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function escutaMensagemEmTempoReal(adicionaMensagem) {
    return  supabaseClient
    .from('message')
    .on('INSERT', (respostaLive)=> { 
        adicionaMensagem(respostaLive.new);
    })
    .subscribe();

}


export default function ChatPage() {
    const root = useRouter();
    const userLog = root.query.username;
    const [message, setMessage] = useState('')
    const [messageList, setMessageList] = useState([])
    


    React.useEffect(() => { 
        supabaseClient
        .from('message')
        .select('*')
        .order('id', { ascending: false})
        .then(({ data  }) => {
            console.log('Dados da Consulta:', data);
            setMessageList(data)
        });

        escutaMensagemEmTempoReal((novaMensagem) => { 
            console.log('Nova mensagem: ', novaMensagem)
            setMessageList((valorAtualDaLista)=> { 
                return [
                    novaMensagem,
                    ...valorAtualDaLista,
                ]
            });
        });


    }, []);
   


    function handleNewMessage(newMessage) {
        const message = {
            // id: messageList.length + 1,
            text: newMessage,
            user: userLog,
        }

        supabaseClient
        .from('message')
        .insert([
            message
        ])
        .then(({data})=> { 
            console.log('Criando mensagem:', data);
            
            

        });

       
        setMessage('')
    }

    function handleDeleteMessage(event) {
        const messageId = Number(event.target.dataset.id)
        console.log(messageId);

        supabaseClient
            .from('message')
            .delete()
            .match({ id: messageId })
            .then(({ data }) => {
                const messageListFiltered = messageList.filter((messageFiltered) => {
                    return messageFiltered.id != data[0].id
                })

                setMessageList(messageListFiltered)
            })



    }



    
    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.8)',
                backgroundImage: 'url(https://i.pinimg.com/originals/32/4a/51/324a511fb2d414841cf6458088aa5d35.jpg)',
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: 'rgba( 000, 000, 000, 0.50 )',
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: 'rgba( 5, 5, 5, 0.90 )',
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >

                    <MessageList messageList={messageList} handleDeleteMessage={handleDeleteMessage} />
                    {/* Lista de mensagens:
                    <ul>
                        {messageList.map((messageItem) => {
                            return (
                                <li key={messageItem.id}>
                                    {messageItem.user}: {messageItem.text}
                                </li>
                            )
                        })}
                    </ul> */}

                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={message}
                            onChange={(event) => {
                                setMessage(event.target.value);
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleNewMessage(message);
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals["000"],
                                marginRight: '12px',
                                color: 'black',
                            }}
                        />
                        

                        <ButtonSendSticker
                            onStickerClick={ (sticker)=> { 
                                console.log('Salva esse sticker no banco', sticker)
                                handleNewMessage(':sticker: ' + sticker)
                            }}
                        />

            <Button
                            onClick={() => handleNewMessage(message)}
                            label='Enviar'
                            fullWidth
                            styleSheet={{
                                height: '80%',
                                width: '20%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px'
                            }}
                            buttonColors={{
                                contrastColor: appConfig.theme.colors.neutrals["000"],
                                mainColor: appConfig.theme.colors.primary[500],
                                mainColorLight: appConfig.theme.colors.primary[400],
                                mainColorStrong: appConfig.theme.colors.primary[600],
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}


function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Sair'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {

    const handleDeleteMessage = props.handleDeleteMessage

    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >

            {props.messageList.map((messageItem) => {

                return (
                    <Text
                        key={messageItem.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            wordBreak: 'break-word',
                            hover: {
                                backgroundColor: 'rgba( 0, 0, 0, 0.21 )',
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                }}
                                src={`https://github.com/${messageItem.user}.png`}
                            />
                            <Text tag="strong">
                                {messageItem.user}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                            <Text
                                onClick={handleDeleteMessage}
                                styleSheet={{
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    marginLeft: 'auto',
                                    color: '#FFF',
                                    backgroundColor: 'rgba(0,0,0,.5)',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }}
                                tag="span"
                                data-id={messageItem.id}
                            >
                                X
                            </Text>
                        </Box>
                        {/* {messageItem.text.startsWith(':sticker:').toString()} */}
                        {messageItem.text.startsWith(':sticker:')
                        ? ( 
                            <Image
                            height='100px'
                            width='100px'
                            src={messageItem.text.replace(':sticker:', '')} />
                        )
                        : ( 
                            messageItem.text
                        )
                        }
                        {/* {messageItem.text} */}
                    </Text>

                )

            })
            }

        </Box>
    )
}