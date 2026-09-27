import { startLanguageServer } from 'langium/lsp';
import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';
import { createMdPublisherServices } from 'md-publisher-language';

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the shared services and language-specific services
const { shared } = createMdPublisherServices({ connection, ...NodeFileSystem });

// Start the language server with the shared services
startLanguageServer(shared);
