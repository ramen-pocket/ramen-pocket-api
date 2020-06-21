import { MariadbConnection } from '../../database/mariadb-connection';
import { MariadbQueryAgent } from '../../database/mariadb-query-agent';
import { MomentProvider } from '../../providers/date-provider/moment-provider';
import { UserStore } from '../../repositories/user/user-store';
import { StoreStore } from '../../repositories/store/store-store';
import { CommentStore } from '../../repositories/comment/comment-store';
import { CommentService } from '../../services/comment/comment-service';
import { PutStoreCommentHandler } from '../../controllers/store/put-store-comment-handler';
import { Guarantee } from '../../controllers/utils/guarantee';
import { handleError } from '../../controllers/sentinel';

const connection = new MariadbConnection();
const queryAgent = new MariadbQueryAgent(connection);
const momentProvider = new MomentProvider();
const userStore = new UserStore(queryAgent, momentProvider);
const storeStore = new StoreStore(queryAgent);
const commentStore = new CommentStore(queryAgent, userStore, storeStore, momentProvider);
const commentService = new CommentService(commentStore);
const putStoreCommentHandler = new PutStoreCommentHandler(commentService);
const guarantee = new Guarantee(putStoreCommentHandler);
guarantee.rescue(handleError);
guarantee.ensure(async () => await connection.disconnect());

export default guarantee.handle;
