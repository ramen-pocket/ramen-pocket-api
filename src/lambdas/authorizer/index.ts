import { MariadbConnection } from '../../database/mariadb-connection';
import { MariadbQueryAgent } from '../../database/mariadb-query-agent';
import { MomentProvider } from '../../providers/date-provider/moment-provider';
import { GoogleSignInProvider } from '../../providers/thrid-party-sign-in-provider/google-sign-in-provider';
import { UserStore } from '../../repositories/user/user-store';
import { UserService } from '../../services/user/user-service';
import { AuthorizerHandler } from '../../controllers/authorizer/handler';
import { AuthorizationGuarantee } from '../../controllers/utils/guarantee';

const { GOOGLE_CLIENT_ID } = process.env;

const connection = new MariadbConnection();
const queryAgent = new MariadbQueryAgent(connection);
const momentProvider = new MomentProvider();
const googleSignInProvider = new GoogleSignInProvider(GOOGLE_CLIENT_ID, momentProvider);
const userStore = new UserStore(queryAgent, momentProvider);
const userService = new UserService(userStore, googleSignInProvider, momentProvider);
const authorizerHandler = new AuthorizerHandler(userService);
const guarantee = new AuthorizationGuarantee(authorizerHandler);
guarantee.ensure(async () => await connection.disconnect());

export default guarantee.handle;
