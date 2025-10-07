# Open AI demo 2

Code presentation to manage life cycle of assistant.



```
function streamRun($threadId, $assistantId, $callback, $context = null) {
    Logger::logMessage("Calling assistant: " . $assistantId . " for thread: " . $threadId);

    $serverId = $context['selected_server_id'];
    $userId = \Drupal::currentUser()->id();

    if ($serverId != null && $serverId != '-1') {
        $serverManager = new ServerManager();
        $server = $serverManager->getItemById($serverId);
    }

    try {
        $stream = $this->clientAi->threads()->runs()->createStreamed(
            threadId: $threadId,
            parameters: [
                'assistant_id' => $assistantId,
            ],
        );
    } catch (\Exception $e) {
        $errorMessage = $e->getMessage();

        Logger::logMessage("Stream read error: " . $errorMessage);

        if (strpos($errorMessage, 'already has an active run') !== false) {
            $callback([
                'type' => 'error',
                'content' => 'Un run est deja en cours d\'execution pour ce thread. Veuillez patienter avant de compléter votre message.'
            ]);
        }
        else {
            $callback([
                'type' => 'error',
                'content' => 'Une erreur est survenue lors de la lecture du flux: ' . $e->getMessage()
            ]);
        }

        return;
    }


    $run = null;
    $runId = null;
    $messageContent = "";
    $hasStartedContent = false;
    
    try {
        do {
            foreach ($stream as $response) {
                switch($response->event) {
                case 'thread.run.created':
                    $runId = $response->response->id;
                    break;
                case 'thread.run.queued':
                    break;
                case 'thread.run.in_progress':
                    $run = $response->response;
                    break;
                case 'thread.message.created':
                    break;
                case 'thread.message.delta':
                    if ($callback && isset($response->response->delta->content)) {
                        foreach ($response->response->delta->content as $content) {
                            if (isset($content->text->value)) {
                                if (!$hasStartedContent) {
                                    $callback([
                                        'type' => 'start_content',
                                        'content' => '',
                                        'run_id' => $runId
                                    ]);
                                    $hasStartedContent = true;
                                }
                                
                                $messageContent .= $content->text->value;
                                $callback([
                                    'type' => 'content',
                                    'content' => $content->text->value
                                ]);
                            }
                        }
                    }
                    break;  
                case 'thread.run.completed':
                    $run = $response->response;
                    if ($callback && empty($messageContent)) {
                        $messages = $this->getMessages($threadId);
                        if (!empty($messages->data)) {
                            $latestMessage = $messages->data[0];
                            if ($latestMessage->role === 'assistant' && !empty($latestMessage->content)) {
                                // Signaler le début du contenu
                                if (!$hasStartedContent) {
                                    $callback([
                                        'type' => 'start_content',
                                        'content' => ''
                                    ]);
                                    $hasStartedContent = true;
                                }
                                
                                // Construire le message complet pour la sauvegarde
                                $completeMessage = '';
                                foreach ($latestMessage->content as $content) {
                                    if (isset($content->text->value)) {
                                        $completeMessage .= $content->text->value;
                                        
                                        $callback([
                                            'type' => 'content',
                                            'content' => $content->text->value
                                        ]);
                                    }
                                }
                                
                                // Sauvegarder le message complet dans la base de données
                                if (!empty($completeMessage)) {
                                    $this->aiManager->saveChatMessage($threadId, $completeMessage, 'assistant', $userId);
                                }
                            }
                        }
                    }
                    else {
                        // Sauvegarder le message accumulé dans la base de données
                        $this->aiManager->saveChatMessage($threadId, $messageContent, 'assistant', $userId);
                    }
                    break;
                    
                case 'thread.run.expired':
                    $run = $response->response;
                    $errorMessage = "Le délai d'exécution a expiré lors de la génération de la réponse.";
                    
                    $this->aiManager->saveChatMessage($threadId, $errorMessage, 'assistant', $userId);
                    
                    $callback([
                        'type' => 'error',
                        'content' => $errorMessage
                    ]);
                    break 3;
                    
                case 'thread.run.cancelled':
                    $run = $response->response;
                    $errorMessage = "La génération de la réponse a été annulée.";
                    
                    $this->aiManager->saveChatMessage($threadId, $errorMessage, 'assistant', $userId);
                    
                    if ($callback) {
                        $callback([
                            'type' => 'error',
                            'content' => $errorMessage
                        ]);
                    }
                    break 3;
                    
                case 'thread.run.failed':
                    $run = $response->response;

                    $errorMessage = "Une erreur est survenue lors de la génération de la réponse: " . $response->response->lastError->message;
                    
                    $this->aiManager->saveChatMessage($threadId, $errorMessage, 'assistant', $userId);
                    
                    $callback([
                        'type' => 'error',
                        'content' => $errorMessage
                    ]);
                    break 3;
                    
                case 'thread.run.requires_action':
                    // Traitement des tool_calls de l'assistant
                    if (isset($response->response->requiredAction) && 
                        isset($response->response->requiredAction->submitToolOutputs) && 
                        isset($response->response->requiredAction->submitToolOutputs->toolCalls)) {
                        
                        $toolCalls = $response->response->requiredAction->submitToolOutputs->toolCalls;
                        
                        $result = $this->manageToolCalls($threadId, $userId, $server, $runId, $toolCalls, $callback, $context);
                        if ($result != null) {
                            $stream = $result;
                        }
                    }
                    break;
                }
            }
        } while ($run && $run->status != "completed");
    } catch (\Exception $e) {
        Logger::logMessage("Stream read error: " . $e->getMessage());

        $callback([
            'type' => 'error',
            'content' => 'Une erreur est survenue lors de la lecture du flux: ' . $e->getMessage()
        ]);

        // We need to cancel the run to unlock the thread
        $this->clientAi->threads()->runs()->cancel(
            threadId: $threadId,
            runId: $runId
        );
    }
    return $run;
}
```
