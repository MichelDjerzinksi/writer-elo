-- 1. Create the secure voting function
create or replace function vote_matchup(winner_id uuid, loser_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  w_elo int;
  l_elo int;
  w_wins int;
  l_wins int;
  exp_winner float;
  exp_loser float;
  k_factor int := 32; -- Using default K-factor
  new_w_elo int;
  new_l_elo int;
begin
  -- Fetch current stats
  select elo, matches_played into w_elo, w_wins from authors where id = winner_id;
  select elo, matches_played into l_elo, l_wins from authors where id = loser_id;

  -- Calculate Expected Score
  exp_winner := 1.0 / (1.0 + power(10.0, (l_elo - w_elo) / 400.0));
  exp_loser := 1.0 / (1.0 + power(10.0, (w_elo - l_elo) / 400.0));

  -- Calculate New Ratings
  new_w_elo := round(w_elo + k_factor * (1 - exp_winner));
  new_l_elo := round(l_elo + k_factor * (0 - exp_loser));

  -- Update Authors
  update authors set elo = new_w_elo, matches_played = matches_played + 1 where id = winner_id;
  update authors set elo = new_l_elo, matches_played = matches_played + 1 where id = loser_id;

  -- Record Match
  insert into matches (winner_id, loser_id) values (winner_id, loser_id);
end;
$$;

-- 2. Revoke insecure permissions
-- Remove ability for anyone to update or insert directly
drop policy "Allow public update to authors" on authors;
drop policy "Allow public insert to authors" on authors;
drop policy "Allow public insert to matches" on matches;

-- 3. Ensure public READ access remains
-- (Assuming "Allow public read access to authors" and "Allow public read access to matches" already exist. If not, uncomment below)
-- create policy "Allow public read access to authors" on authors for select using (true);

-- 4. Allow anonymous users to call the function (enabled by default for public functions, but good to know)
grant execute on function vote_matchup to anon, authenticated, service_role;
