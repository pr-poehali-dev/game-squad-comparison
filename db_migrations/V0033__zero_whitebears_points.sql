-- Обнулить баллы участников дома WhiteBEARS (id=4)
UPDATE t_p63666683_game_squad_compariso.activity_points SET points = 0 WHERE user_id = 10;

-- Пересчитать рейтинг дома
UPDATE t_p63666683_game_squad_compariso.houses SET rating_points = 0 WHERE id = 4;